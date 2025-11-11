# Intune Microsoft Graph API Guide

This guide documents the correct Microsoft Graph API endpoints, permissions, and error handling for accessing Intune data.

## 1. CORRECT ENDPOINTS FOR EACH DATA TYPE

### Configuration Profiles (Traditional/Legacy Device Configurations)

**Endpoint**: `https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations`

```
GET all: /deviceManagement/deviceConfigurations
GET one: /deviceManagement/deviceConfigurations/{id}
```

**Required Permission(s)**:
- `DeviceManagementConfiguration.Read.All` (read-only)
- `DeviceManagementConfiguration.ReadWrite.All` (read/write)

**Response**: Returns an array of device configurations (Windows, iOS, Android, macOS settings)

**Notes**:
- This endpoint is in v1.0 (stable)
- Returns TRADITIONAL device configurations
- Not the same as Settings Catalog policies (those use `/configurationPolicies`)

---

### Configuration Policies (Settings Catalog - Newer Approach)

**Endpoint**: `https://graph.microsoft.com/beta/deviceManagement/configurationPolicies`

```
GET all: /deviceManagement/configurationPolicies
GET settings: /deviceManagement/configurationPolicies('{id}')/settings
```

**Required Permission(s)**:
- `DeviceManagementConfiguration.Read.All` (read-only)
- `DeviceManagementConfiguration.ReadWrite.All` (read/write)

**Response**: Returns configuration policies from Settings Catalog

**⚠️ CRITICAL NOTES**:
- This endpoint is BETA ONLY - NOT available in v1.0
- Settings Catalog is the newer Microsoft-recommended approach
- Requires using beta endpoint: `https://graph.microsoft.com/beta`
- May not be available in all tenants or regions

---

### PowerShell Scripts

**Endpoint v1.0**: `https://graph.microsoft.com/v1.0/deviceManagement/deviceManagementScripts`

```
GET all: /deviceManagement/deviceManagementScripts
GET one: /deviceManagement/deviceManagementScripts/{id}
GET content: /deviceManagement/deviceManagementScripts/{id}?$select=scriptContent
```

**Required Permission(s)**:
- `DeviceManagementConfiguration.Read.All` (read-only)
- `DeviceManagementConfiguration.ReadWrite.All` (read/write)

**Response**: Returns PowerShell scripts configured in Intune

**Notes**:
- Available in both v1.0 and beta
- Includes script metadata and content
- Used for Intune remediations and proactive remediations

---

### Compliance Policies

**Endpoint**: `https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies`

```
GET all: /deviceManagement/deviceCompliancePolicies
GET one: /deviceManagement/deviceCompliancePolicies/{id}
```

**Required Permission(s)**:
- `DeviceManagementConfiguration.Read.All` (read-only)
- `DeviceManagementConfiguration.ReadWrite.All` (read/write)

**Response**: Returns device compliance policies

**Notes**:
- Stable v1.0 endpoint
- Most common endpoint for accessing compliance rules
- Works reliably across all tenants

---

### Mobile Applications

**Endpoint**: `https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps`

```
GET all: /deviceAppManagement/mobileApps
GET one: /deviceAppManagement/mobileApps/{id}
```

**Required Permission(s)**:
- `DeviceManagementApps.Read.All` (read-only)
- `DeviceManagementApps.ReadWrite.All` (read/write)

**Response**: Returns mobile applications (iOS, Android, Windows apps)

**Notes**:
- Stable v1.0 endpoint
- Includes both managed and unmanaged apps
- Returns basic app metadata

---

## 2. GRAPH API BASE URLS

### Standard v1.0 (Stable)
```
https://graph.microsoft.com/v1.0
```
- Officially released and supported
- Guaranteed backward compatibility
- Most endpoints available

### Beta (Preview Features)
```
https://graph.microsoft.com/beta
```
- New features and changes
- No guarantee of stability
- Subject to breaking changes
- Examples: `/deviceManagement/configurationPolicies`

---

## 3. REQUIRED DELEGATED PERMISSIONS

When registering your Azure AD application, request these delegated permissions:

### For Device Management:
- `DeviceManagementConfiguration.Read.All` - Read configuration profiles, scripts, compliance policies
- `DeviceManagementConfiguration.ReadWrite.All` - Full read/write access
- `DeviceManagementManagedDevices.Read.All` - Read managed device information
- `DeviceManagementApps.Read.All` - Read mobile app information
- `DeviceManagementApps.ReadWrite.All` - Full read/write for apps

### For User/Directory Info:
- `Directory.Read.All` - Read user and organization information
- `User.Read` - Read current user profile

### For Token Refresh:
- `offline_access` - Allows refresh token issuance

### Recommended Minimum Set:
```
DeviceManagementConfiguration.Read.All
DeviceManagementApps.Read.All
DeviceManagementManagedDevices.Read.All
DeviceManagementServiceConfig.Read.All
offline_access
```

---

## 4. COMMON ERRORS AND SOLUTIONS

### 403 Forbidden
```
Error: "Authorization_RequestDenied" or "Insufficient privileges to complete the operation"
```
**Causes**:
- User doesn't have the required Azure AD role (Intune Administrator, etc.)
- Permission not granted in Azure AD app registration
- User hasn't granted consent to the application
- Admin consent required but not provided

**Solution**:
- Ensure user is assigned "Intune Administrator" or "Endpoint Administrator" role in Azure AD
- Verify permissions are requested in app registration
- Have admin grant consent in Azure AD
- Request admin consent URL: `https://login.microsoftonline.com/{tenantId}/adminconsent?client_id={appId}`

---

### 404 Not Found
```
Error: "Resource not found for the segment '{endpoint}'"
```
**Causes**:
- Endpoint path is incorrect
- Using v1.0 for a beta-only endpoint (e.g., `/configurationPolicies`)
- Resource ID doesn't exist
- Endpoint not available in this tenant version

**Solution**:
- Verify endpoint spelling and path structure
- Check if endpoint requires beta: `graph.microsoft.com/beta`
- Verify resource exists with correct ID
- Check if endpoint is available in your region/tenant

**Examples**:
- ❌ WRONG: `/deviceManagement/configurationPolicies` (v1.0)
- ✅ CORRECT: `/deviceManagement/configurationPolicies` (beta only - use `graph.microsoft.com/beta`)
- ✅ CORRECT: `/deviceManagement/deviceConfigurations` (v1.0 - traditional configs)

---

### 400 Bad Request
```
Error: "Bad Request" or "Invalid query"
```
**Causes**:
- Malformed OData query
- Invalid filter syntax
- Requesting endpoint with wrong API version

**Solution**:
- Verify query syntax with Microsoft docs
- Use correct OData operators ($filter, $select, etc.)
- Ensure using correct API version for endpoint

---

### 401 Unauthorized
```
Error: "Authorization_IdentityNotFound" or "Invalid token"
```
**Causes**:
- Access token expired
- Invalid or malformed token
- Client ID mismatch

**Solution**:
- Request new token using refresh token
- Verify client ID matches app registration
- Check token expiration time in JWT

---

## 5. IMPLEMENTATION BEST PRACTICES

### Error Handling Pattern
```typescript
try {
  const response = await callGraphAPI('/endpoint');
  if (!response?.value) {
    console.warn('No data returned');
    return [];
  }
  return response.value;
} catch (error) {
  if (error.status === 404) {
    console.error('Endpoint not found - may require beta');
  } else if (error.status === 403) {
    console.error('Missing permissions or consent');
  }
  throw error;
}
```

### API Version Strategy
```typescript
const endpoints = {
  // v1.0 endpoints (stable, always available)
  deviceConfigurations: {
    path: '/deviceManagement/deviceConfigurations',
    version: 'v1.0'
  },

  // beta endpoints (newer features, use with caution)
  configurationPolicies: {
    path: '/deviceManagement/configurationPolicies',
    version: 'beta'
  }
};
```

### Fallback Strategy
```typescript
// Try modern Settings Catalog first
try {
  const policies = await loadConfigurationPolicies(); // beta
  if (policies.length > 0) return policies;
} catch (error) {
  console.warn('Settings Catalog not available, trying traditional configs');
}

// Fall back to traditional device configurations
return loadDeviceConfigurations(); // v1.0
```

---

## 6. TESTING ENDPOINTS

Use Microsoft Graph Explorer to test endpoints:
- URL: `https://developer.microsoft.com/en-us/graph/graph-explorer`
- Select your tenant
- Try GET requests to verify endpoints work
- Check permissions required
- Review response structure

### Example Test Queries:
```
GET /deviceManagement/deviceConfigurations
GET /deviceManagement/deviceCompliancePolicies
GET /deviceAppManagement/mobileApps
GET /deviceManagement/deviceManagementScripts
GET /deviceManagement/configurationPolicies (beta only)
```

---

## 7. REFERENCES

- [Microsoft Graph Intune Overview](https://learn.microsoft.com/en-us/graph/intune-concept-overview)
- [Device Configurations API](https://learn.microsoft.com/en-us/graph/api/resources/intune-deviceconfig-deviceconfiguration)
- [Configuration Policies API (Beta)](https://learn.microsoft.com/en-us/graph/api/resources/devicemanagement-configurationpolicy)
- [PowerShell Scripts API](https://learn.microsoft.com/en-us/graph/api/resources/intune-devices-devicemanagementscript)
- [Compliance Policies API](https://learn.microsoft.com/en-us/graph/api/resources/intune-deviceconfig-devicecompliancepolicy)
- [Mobile Apps API](https://learn.microsoft.com/en-us/graph/api/resources/intune-apps-mobileapp)

---

## Summary Table

| Data Type | Endpoint | API Version | Status | Permission |
|-----------|----------|-------------|--------|-----------|
| Device Configurations | `/deviceManagement/deviceConfigurations` | v1.0 | Stable ✅ | DeviceManagementConfiguration.Read.All |
| Configuration Policies | `/deviceManagement/configurationPolicies` | beta | Preview ⚠️ | DeviceManagementConfiguration.Read.All |
| PowerShell Scripts | `/deviceManagement/deviceManagementScripts` | v1.0 | Stable ✅ | DeviceManagementConfiguration.Read.All |
| Compliance Policies | `/deviceManagement/deviceCompliancePolicies` | v1.0 | Stable ✅ | DeviceManagementConfiguration.Read.All |
| Mobile Apps | `/deviceAppManagement/mobileApps` | v1.0 | Stable ✅ | DeviceManagementApps.Read.All |

---

**Last Updated**: November 2024
**API Version**: Microsoft Graph v1.0 and beta
