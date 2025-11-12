// AI System Prompts and Templates for IntuneHero

/**
 * Main system prompt for the AI assistant
 */
export const SYSTEM_PROMPT = `You are an expert AI assistant for IntuneHero, a Microsoft Intune configuration management platform.

Your primary responsibilities:
1. Help users search and find Intune configurations (profiles, scripts, compliance policies, apps)
2. Explain what configurations do in plain English
3. Recommend best practice settings based on security frameworks (CIS, NIST, HIPAA)
4. Compare configurations and identify differences
5. Guide users through exporting configurations

Your expertise includes:
- Microsoft Intune device management
- Windows, iOS, Android, and macOS configuration profiles
- PowerShell scripts for device automation
- Compliance policies and security best practices
- Mobile application management
- Microsoft Graph API

Guidelines:
- Be concise and actionable
- Use technical terms when appropriate, but explain them
- Provide step-by-step guidance when needed
- Reference Microsoft documentation when relevant
- Warn about security implications
- Always prioritize user privacy and data security

When users ask questions:
1. Understand their intent (search, explain, recommend, compare, export)
2. Use the available context about their current view and selections
3. Provide specific, actionable answers
4. Suggest related actions they might find useful

Remember: You are helping IT administrators manage enterprise device configurations. Be professional, accurate, and security-conscious.`;

/**
 * Prompt for searching configurations
 */
export const SEARCH_PROMPT = (query: string, context: string) => `
User is searching for: "${query}"

Current context:
${context}

Tasks:
1. Parse the search query to understand intent
2. Identify key terms (e.g., "BitLocker", "Windows", "security")
3. Match against available configurations
4. Return relevant results ranked by relevance
5. Suggest filters or refinements if needed

Respond with:
- A brief summary of what you found
- List of matching configurations (names and brief descriptions)
- Suggested next actions or filters
`;

/**
 * Prompt for explaining configurations
 */
export const EXPLAIN_PROMPT = (configName: string, configData: string) => `
Explain this Intune configuration in plain English:

Configuration Name: ${configName}
Configuration Data:
${configData}

Provide:
1. **What it does**: Brief summary (1-2 sentences)
2. **Purpose**: Why an admin would use this
3. **Impact**: What happens to devices when applied
4. **Affected devices**: What types of devices this targets
5. **Related policies**: Other policies that might work with this

Keep the explanation clear, concise, and focused on practical implications.
`;

/**
 * Prompt for recommending settings
 */
export const RECOMMEND_PROMPT = (scenario: string, platform: string) => `
Recommend best practice Intune settings for this scenario:

Scenario: ${scenario}
Platform: ${platform}

Provide recommendations based on:
- CIS Benchmarks
- NIST guidelines
- Microsoft security baselines
- Industry best practices

Structure your response:
1. **Overview**: Brief summary of the scenario
2. **Recommended Policies**: List of 3-5 key policies to implement
3. **Settings**: Specific settings for each policy
4. **Security Level**: Classification (basic, enhanced, strict)
5. **Trade-offs**: Any user experience impacts
6. **Implementation Order**: Suggested rollout sequence

Focus on practical, implementable recommendations.
`;

/**
 * Prompt for comparing configurations
 */
export const COMPARE_PROMPT = (configs: Array<{ name: string; data: string }>) => `
Compare these Intune configurations and identify differences:

${configs.map((c, i) => `
Configuration ${i + 1}: ${c.name}
Data:
${c.data}
`).join('\n---\n')}

Provide:
1. **Key Differences**: Main settings that differ between configurations
2. **Similarities**: Common settings across all configurations
3. **Conflicts**: Any settings that might conflict if both are applied
4. **Recommendations**: Which configuration to use in different scenarios
5. **Merge Possibility**: Can these be safely merged?

Present differences in a clear, tabular format where possible.
`;

/**
 * Prompt for export assistance
 */
export const EXPORT_PROMPT = (selectedCount: number, format: string) => `
User wants to export ${selectedCount} Intune configurations in ${format} format.

Provide:
1. **Export Summary**: What will be included
2. **Best Format**: Confirm if ${format} is the best choice or suggest alternatives
3. **Next Steps**: Guide the user through the export process
4. **Tips**: Any important considerations (e.g., "Include related scripts?", "Remove sensitive data?")
5. **Usage**: How to use the exported data (import to another tenant, backup, documentation)

Be helpful and guide them to a successful export.
`;

/**
 * Prompt for parsing natural language queries
 */
export const PARSE_QUERY_PROMPT = (query: string) => `
Parse this natural language query into structured search parameters:

Query: "${query}"

Extract:
1. **Intent**: (search, explain, compare, recommend, export, help)
2. **Type**: (profiles, scripts, compliance, apps, or all)
3. **Platform**: (Windows, iOS, Android, macOS, or unspecified)
4. **Keywords**: Key terms to search for
5. **Filters**: Any specific filters mentioned

Respond in JSON format:
{
  "intent": "search|explain|compare|recommend|export|help",
  "type": "profiles|scripts|compliance|apps|all",
  "platform": "Windows|iOS|Android|macOS|unspecified",
  "keywords": ["keyword1", "keyword2"],
  "filters": {}
}
`;

/**
 * Prompt for generating quick actions
 */
export const QUICK_ACTIONS_PROMPT = (configName: string, context: string) => `
Generate quick action suggestions for this configuration:

Configuration: ${configName}
Context: ${context}

Suggest 3-5 quick actions that would be helpful, such as:
- "Export this policy as JSON"
- "Find similar configurations"
- "Compare with another policy"
- "View devices with this policy"
- "Check for conflicts"
- "Duplicate this policy"

Each action should be:
- Specific to this configuration
- Actionable (user can do it now)
- Relevant to common workflows

Format as JSON array:
[
  {
    "label": "Action label",
    "description": "Brief description",
    "icon": "icon-name"
  }
]
`;

/**
 * Prompt for security analysis
 */
export const SECURITY_ANALYSIS_PROMPT = (configData: string) => `
Analyze this Intune configuration for security best practices:

Configuration Data:
${configData}

Evaluate against:
1. CIS Benchmarks
2. NIST Cybersecurity Framework
3. Microsoft Security Baselines
4. OWASP Mobile Top 10 (if applicable)

Provide:
1. **Security Score**: 0-100
2. **Strengths**: What's configured well
3. **Weaknesses**: Security gaps or misconfigurations
4. **Recommendations**: Specific improvements (high/medium/low priority)
5. **Compliance**: Which frameworks this aligns with

For each recommendation, provide:
- **Severity**: high, medium, low
- **Title**: Brief heading
- **Description**: What the issue is
- **Action**: How to fix it
- **Impact**: Effect on users/devices
`;

/**
 * Prompt for conflict detection (Phase 2 preview)
 */
export const CONFLICT_DETECTION_PROMPT = (configs: string[]) => `
Analyze these configurations for potential conflicts:

${configs.map((c, i) => `Configuration ${i + 1}:\n${c}`).join('\n\n---\n\n')}

Identify:
1. **Direct Conflicts**: Settings that directly contradict each other
2. **Precedence Issues**: Multiple policies setting the same value
3. **Scope Overlaps**: Policies targeting the same devices/users
4. **Cumulative Effects**: Settings that combine in unexpected ways
5. **Performance Impacts**: Policies that might slow devices

For each conflict:
- **Severity**: critical, high, medium, low
- **Type**: Direct conflict, precedence issue, scope overlap, etc.
- **Description**: What the conflict is
- **Resolution**: How to fix it
- **Affected Devices**: Who is impacted
`;

/**
 * User-facing help message
 */
export const HELP_MESSAGE = `
👋 **Welcome to IntuneHero AI Assistant!**

I can help you with:

🔍 **Search Configurations**
- "Show me Windows security policies"
- "Find BitLocker encryption settings"
- "List all PowerShell scripts"

💡 **Explain Policies**
- "What does this configuration do?"
- "Explain the BitLocker policy"
- "How does this affect devices?"

⚙️ **Recommend Settings**
- "Best security settings for remote workers"
- "Recommended iOS device restrictions"
- "HIPAA-compliant configurations"

🔄 **Compare Configurations**
- "Compare these two policies"
- "Show differences between iOS profiles"
- "Which policy is more secure?"

📦 **Export Assistance**
- "Help me export all Windows policies"
- "Download selected items as JSON"
- "Create a backup of compliance policies"

**Tips:**
- Ask questions naturally
- Be specific about what you want
- Use platform names (Windows, iOS, Android, macOS)
- Mention if you're looking for security/compliance features

**Examples:**
- "Show me all Windows 11 security policies and export them"
- "What's the difference between Policy A and Policy B?"
- "Recommend BitLocker settings for laptops"

What would you like to know?
`;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NO_RESULTS: "I couldn't find any configurations matching your query. Try different keywords or filters.",
  INVALID_ID: "I couldn't find a configuration with that ID. Please check and try again.",
  API_ERROR: "I'm having trouble connecting to the API. Please try again in a moment.",
  PARSE_ERROR: "I didn't quite understand that. Could you rephrase your question?",
  NO_CONTEXT: "I don't have enough context to answer that. Please provide more details.",
  UNAUTHORIZED: "You don't have permission to access that configuration.",
  TIMEOUT: "The request took too long. Please try a simpler query.",
  RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SEARCH_COMPLETE: (count: number) => `Found ${count} configuration${count === 1 ? '' : 's'} matching your query.`,
  EXPORT_READY: (format: string) => `Your export in ${format} format is ready for download.`,
  COMPARISON_COMPLETE: (count: number) => `Successfully compared ${count} configurations.`,
  RECOMMENDATION_READY: "Here are my recommendations based on best practices.",
};
