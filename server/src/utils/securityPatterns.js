const securityPatterns = [
  {
    name: 'SQL Injection',
    pattern: /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE).*FROM/i,
    severity: 'high',
    description: 'Potential SQL injection vulnerability detected'
  },
  {
    name: 'XSS',
    pattern: /<script>|javascript:|on\w+\s*=/i,
    severity: 'high',
    description: 'Potential Cross-Site Scripting (XSS) vulnerability detected'
  },
  {
    name: 'Command Injection',
    pattern: /(exec|system|eval|shell_exec|passthru|`.*`)/i,
    severity: 'high',
    description: 'Potential command injection vulnerability detected'
  }
];

/**
 * Analyze code for security risks, focusing on critical security issues
 * @param {string} code - The code text to analyze
 * @returns {Object} - Analysis results
 */
const analyzeCodeForSecurity = (code) => {
  // Return early if code is undefined or empty
  if (!code || typeof code !== 'string') {
    return {
      issues: [],
      issuesFound: false
    };
  }

  // Normalize the code to handle OCR variations
  const normalizedCode = code
    .toLowerCase()
    .replace(/['""`]/g, '') // Remove all types of quotes since they're unreliable
    .replace(/\s+/g, ' ');  // Normalize whitespace

  const issues = [];
  
  // Critical security patterns that don't rely on quotes
  const patterns = {
    // AWS Credentials - look for patterns without quotes
    awsKey: {
      pattern: /akia[0-9a-z]{16}/g,  // AWS keys are always uppercase but we check lowercase due to normalization
      type: 'AWS Access Key',
      description: 'Found AWS Access Key ID',
      severity: 'Critical'
    },
    
    // Database Connection Strings - look for URL patterns
    dbConnection: {
      pattern: /(mongodb|mysql|postgresql|postgres):\/\/[^@\s]+@[^\s]+/g,
      type: 'Database Credentials',
      description: 'Found database connection string with credentials',
      severity: 'Critical'
    },

    // Common Password Variable Names with Assignment
    password: {
      pattern: /(password|passwd|pwd|secret)\s*[=:]\s*\S{8,}/g,
      type: 'Password',
      description: 'Found potential hardcoded password or secret',
      severity: 'Critical'
    },

    // Private Keys - these have distinct patterns
    privateKey: {
      pattern: /begin\s*(rsa|dsa|ec|openssh)\s*private\s*key/g,
      type: 'Private Key',
      description: 'Found private key',
      severity: 'Critical'
    },

    // API Keys - look for common patterns without relying on quotes
    apiKey: {
      pattern: /(api.?key|api.?token|auth.?token|access.?token)\s*[=:]\s*[a-z0-9_\-]{20,}/g,
      type: 'API Key',
      description: 'Found API key or token',
      severity: 'Critical'
    },

    // Environment Variables containing sensitive data
    envVar: {
      pattern: /(process\.env\.|dotenv|config\[)[a-z_]*secret[a-z_]*/g,
      type: 'Environment Secret',
      description: 'Found reference to secret in environment variables',
      severity: 'Critical'
    }
  };

  // Check each pattern
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = normalizedCode.match(pattern.pattern);
    if (matches) {
      issues.push({
        type: pattern.type,
        description: pattern.description,
        severity: pattern.severity,
        matches: matches.length // Add count of matches found
      });
    }
  }

  return {
    issues,
    issuesFound: issues.length > 0
  };
};

module.exports = {
  securityPatterns,
  analyzeCodeForSecurity
}; 