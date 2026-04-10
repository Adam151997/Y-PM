// Enhanced Form Components
export { EnhancedInput } from './components/enhanced-input';
export type { EnhancedInputProps, InputVariant, InputSize } from './components/enhanced-input';

export { EnhancedTextarea } from './components/enhanced-textarea';
export type { EnhancedTextareaProps, TextareaVariant, TextareaSize } from './components/enhanced-textarea';

export { EnhancedSelect } from './components/enhanced-select';
export type { EnhancedSelectProps, SelectOption, SelectVariant, SelectSize } from './components/enhanced-select';

// Multi-step Form System
export { MultiStepForm, useMultiStepForm } from './components/multi-step-form';
export type { FormStep, MultiStepFormProps } from './components/multi-step-form';

// Slide-over Panels
export { SlideOverPanel, useSlideOverPanel, QuickEditPanel } from './components/slide-over-panel';
export type { SlideOverPanelProps, QuickEditPanelProps } from './components/slide-over-panel';

// Confirmation Dialogs
export { 
  ConfirmationDialog, 
  DeleteConfirmationDialog,
  SuccessConfirmationDialog,
  WarningConfirmationDialog,
  InfoConfirmationDialog,
  useConfirmationDialog,
  confirmAction
} from './components/confirmation-dialog';
export type { ConfirmationDialogProps, DialogVariant } from './components/confirmation-dialog';

// Validation Utilities
export { 
  validation,
  validators,
  validateValue,
  createValidation,
  VALIDATION_PRESETS,
  useFormValidation
} from './utils/validation';
export type { 
  ValidationRule, 
  ValidationResult, 
  ValidationConfig 
} from './utils/validation';

// Smart Defaults & Suggestions
export { 
  smart,
  useSmartSuggestions,
  useSmartDefault,
  suggestionSources,
  smartDefaults,
  createSuggestionConfig,
  createAutoCompleteConfig
} from './utils/smart-defaults';
export type { 
  Suggestion, 
  SuggestionConfig, 
  AutoCompleteConfig, 
  SmartDefaultConfig 
} from './utils/smart-defaults';

// Form Hooks
export { useFormValidation } from './utils/validation';
export { useSmartSuggestions, useSmartDefault } from './utils/smart-defaults';
export { useMultiStepForm } from './components/multi-step-form';
export { useSlideOverPanel } from './components/slide-over-panel';
export { useConfirmationDialog } from './components/confirmation-dialog';

// Complete Forms System
export const Forms = {
  // Components
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect,
  MultiStepForm,
  SlideOverPanel,
  QuickEditPanel,
  ConfirmationDialog,
  DeleteConfirmationDialog,
  SuccessConfirmationDialog,
  WarningConfirmationDialog,
  InfoConfirmationDialog,
  
  // Utilities
  validation,
  smart,
  
  // Hooks
  useFormValidation,
  useSmartSuggestions,
  useSmartDefault,
  useMultiStepForm,
  useSlideOverPanel,
  useConfirmationDialog,
  
  // Presets
  VALIDATION_PRESETS,
  suggestionSources,
  smartDefaults,
};
