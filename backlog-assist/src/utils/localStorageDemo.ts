import { localStorageUtils } from './localStorage';
import type { RuleSet, ReportData, ChecklistItem } from '../types';

/**
 * Demonstration utility for localStorage functionality
 * This can be used in the browser console to test localStorage features
 */
export const localStorageDemo = {
  // Test rule set operations
  testRuleSetOperations: () => {
    console.log('=== Testing Rule Set Operations ===');
    
    const testRuleSet: RuleSet = {
      id: 'demo-rule-set',
      name: 'Demo Rule Set',
      description: 'A demonstration rule set for testing localStorage',
      version: '1.0.0',
      rules: [
        {
          id: 'demo-rule-1',
          text: 'Check if demo rule 1 works',
          category: 'Demo Category',
          priority: 1,
          description: 'This is a demo rule for testing'
        },
        {
          id: 'demo-rule-2',
          text: 'Check if demo rule 2 works',
          category: 'Demo Category',
          priority: 2
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save rule set
    localStorageUtils.saveRuleSet(testRuleSet);
    console.log('✓ Rule set saved');

    // Retrieve rule sets
    const retrieved = localStorageUtils.getRuleSets();
    console.log('✓ Rule sets retrieved:', retrieved.length);

    // Update rule set
    const updatedRuleSet = {
      ...testRuleSet,
      name: 'Updated Demo Rule Set',
      description: 'Updated description'
    };
    localStorageUtils.saveRuleSet(updatedRuleSet);
    console.log('✓ Rule set updated');

    return retrieved;
  },

  // Test form data operations
  testFormDataOperations: () => {
    console.log('=== Testing Form Data Operations ===');
    
    const testFormData: Partial<ReportData> = {
      issueNumber: 'DEMO-123',
      description: 'This is a demo issue for testing localStorage',
      priority: 'high',
      category: 'Demo Category',
      relatedIssues: ['DEMO-120', 'DEMO-121']
    };

    // Save form data
    localStorageUtils.saveFormData(testFormData);
    console.log('✓ Form data saved');

    // Retrieve form data
    const retrieved = localStorageUtils.getFormData();
    console.log('✓ Form data retrieved:', retrieved);

    return retrieved;
  },

  // Test checklist operations
  testChecklistOperations: () => {
    console.log('=== Testing Checklist Operations ===');
    
    const testChecklist: ChecklistItem[] = [
      {
        id: 'demo-item-1',
        text: 'Demo checklist item 1',
        checked: true,
        category: 'Demo Category 1'
      },
      {
        id: 'demo-item-2',
        text: 'Demo checklist item 2',
        checked: false,
        category: 'Demo Category 2'
      }
    ];

    // Save checklist
    localStorageUtils.saveChecklistState(testChecklist);
    console.log('✓ Checklist saved');

    // Retrieve checklist
    const retrieved = localStorageUtils.getChecklistState();
    console.log('✓ Checklist retrieved:', retrieved);

    return retrieved;
  },

  // Test data validation
  testDataValidation: () => {
    console.log('=== Testing Data Validation ===');
    
    const validation = localStorageUtils.validateStoredData();
    console.log('✓ Data validation result:', validation);

    if (!validation.isValid) {
      console.log('⚠ Validation errors found:', validation.errors);
      
      // Test data repair
      const repair = localStorageUtils.repairData();
      console.log('✓ Data repair result:', repair);
    }

    return validation;
  },

  // Test export/import functionality
  testExportImport: () => {
    console.log('=== Testing Export/Import ===');
    
    // Export data
    const exported = localStorageUtils.exportData();
    console.log('✓ Data exported (length):', exported.length);

    // Clear all data
    localStorageUtils.clearAllData();
    console.log('✓ All data cleared');

    // Import data back
    const importResult = localStorageUtils.importData(exported);
    console.log('✓ Data import result:', importResult);

    return { exported, importResult };
  },

  // Test storage information
  testStorageInfo: () => {
    console.log('=== Testing Storage Information ===');
    
    const info = localStorageUtils.getStorageInfo();
    console.log('✓ Storage info:', {
      usedKB: Math.round(info.used / 1024),
      availableKB: Math.round(info.available / 1024),
      keys: info.keys
    });

    return info;
  },

  // Run all tests
  runAllTests: () => {
    console.log('🚀 Running all localStorage tests...\n');
    
    try {
      localStorageDemo.testRuleSetOperations();
      console.log('');
      
      localStorageDemo.testFormDataOperations();
      console.log('');
      
      localStorageDemo.testChecklistOperations();
      console.log('');
      
      localStorageDemo.testDataValidation();
      console.log('');
      
      localStorageDemo.testStorageInfo();
      console.log('');
      
      localStorageDemo.testExportImport();
      console.log('');
      
      console.log('✅ All localStorage tests completed successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  },

  // Clean up test data
  cleanup: () => {
    console.log('🧹 Cleaning up test data...');
    localStorageUtils.clearAllData();
    console.log('✓ Cleanup completed');
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).localStorageDemo = localStorageDemo;
  console.log('💡 localStorage demo functions are available in the browser console as "localStorageDemo"');
  console.log('💡 Try: localStorageDemo.runAllTests()');
}