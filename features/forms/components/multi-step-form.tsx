'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, Save } from 'lucide-react';
import { useReducedMotion } from '@/features/micro-interactions';
import { ANIMATION_TIMING, EASING } from '@/features/micro-interactions/utils/animation-utils';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  validation?: () => Promise<boolean> | boolean;
  disabled?: boolean;
  completed?: boolean;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  currentStep?: number;
  onStepChange?: (stepIndex: number) => void;
  onComplete?: () => void;
  onSave?: () => Promise<void> | void;
  showProgress?: boolean;
  showNavigation?: boolean;
  showStepTitles?: boolean;
  saveButtonText?: string;
  nextButtonText?: string;
  previousButtonText?: string;
  completeButtonText?: string;
  className?: string;
  allowSkip?: boolean;
  autoSave?: boolean;
  saveOnStepChange?: boolean;
}

export function MultiStepForm({
  steps,
  currentStep: externalStep,
  onStepChange,
  onComplete,
  onSave,
  showProgress = true,
  showNavigation = true,
  showStepTitles = true,
  saveButtonText = 'Save',
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  completeButtonText = 'Complete',
  className,
  allowSkip = false,
  autoSave = false,
  saveOnStepChange = false,
}: MultiStepFormProps) {
  const [internalStep, setInternalStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const reducedMotion = useReducedMotion();

  const currentStep = externalStep !== undefined ? externalStep : internalStep;
  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Handle step change
  const handleStepChange = useCallback(async (newStep: number) => {
    if (newStep < 0 || newStep >= totalSteps) return;
    if (steps[newStep].disabled) return;

    // Validate current step if moving forward
    if (newStep > currentStep && !allowSkip) {
      const validation = steps[currentStep].validation;
      if (validation) {
        setIsValidating(true);
        try {
          const isValid = await validation();
          if (!isValid) {
            setIsValidating(false);
            return;
          }
        } catch {
          setIsValidating(false);
          return;
        }
        setIsValidating(false);
      }
    }

    // Save if enabled
    if (saveOnStepChange && onSave) {
      setIsSaving(true);
      try {
        await onSave();
      } catch (error) {
        console.error('Failed to save:', error);
      } finally {
        setIsSaving(false);
      }
    }

    // Mark current step as completed
    if (newStep > currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }

    // Update step
    if (externalStep === undefined) {
      setInternalStep(newStep);
    }
    onStepChange?.(newStep);
  }, [currentStep, totalSteps, steps, allowSkip, saveOnStepChange, onSave, onStepChange, externalStep]);

  // Auto-save
  useEffect(() => {
    if (!autoSave || !onSave) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave();
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 5000); // Auto-save every 5 seconds

    return () => clearTimeout(timeoutId);
  }, [currentStep, autoSave, onSave]);

  // Handle next step
  const handleNext = async () => {
    if (isLastStep) {
      if (onComplete) {
        setIsValidating(true);
        try {
          await onComplete();
        } finally {
          setIsValidating(false);
        }
      }
      return;
    }

    await handleStepChange(currentStep + 1);
  };

  // Handle previous step
  const handlePrevious = () => {
    handleStepChange(currentStep - 1);
  };

  // Handle step click
  const handleStepClick = async (stepIndex: number) => {
    // Allow going back to completed steps
    if (completedSteps.has(stepIndex) || stepIndex < currentStep) {
      await handleStepChange(stepIndex);
    }
  };

  // Calculate step status
  const getStepStatus = (index: number) => {
    if (index === currentStep) return 'current';
    if (completedSteps.has(index) || steps[index].completed) return 'completed';
    if (index < currentStep) return 'visited';
    return 'upcoming';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress indicator */}
      {showProgress && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full bg-primary transition-all duration-500',
                reducedMotion && 'transition-none'
              )}
              style={{
                width: `${progressPercentage}%`,
                transition: reducedMotion ? 'none' : `width ${ANIMATION_TIMING.SLOW} ${EASING.EASE_IN_OUT}`,
              }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isClickable = status === 'completed' || status === 'visited' || index < currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => isClickable && handleStepClick(index)}
                  disabled={!isClickable || step.disabled}
                  className={cn(
                    'relative flex flex-col items-center',
                    !isClickable && 'cursor-default',
                    step.disabled && 'opacity-50'
                  )}
                >
                  {/* Step circle */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                      reducedMotion && 'transition-none',
                      status === 'current' && 'border-primary bg-primary text-primary-foreground',
                      status === 'completed' && 'border-green-500 bg-green-500 text-white',
                      status === 'visited' && 'border-primary bg-background',
                      status === 'upcoming' && 'border-muted bg-background text-muted-foreground',
                      isClickable && !step.disabled && 'hover:scale-110 hover:border-primary/80'
                    )}
                    style={{
                      transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
                    }}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Step title */}
                  {showStepTitles && (
                    <div className="mt-2 text-center">
                      <div
                        className={cn(
                          'text-xs font-medium transition-colors',
                          status === 'current' && 'text-primary',
                          status === 'completed' && 'text-green-600 dark:text-green-400',
                          status === 'visited' && 'text-foreground',
                          status === 'upcoming' && 'text-muted-foreground'
                        )}
                      >
                        {step.title}
                      </div>
                      {step.description && (
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {step.description}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connecting line (except for last step) */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-full top-5 h-0.5 w-8 -translate-x-1/2',
                        status === 'completed' || status === 'visited' || status === 'current'
                          ? 'bg-primary'
                          : 'bg-muted'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current step content */}
      <Card
        className={cn(
          'transition-all duration-300',
          reducedMotion && 'transition-none',
          isValidating && 'opacity-70'
        )}
        style={{
          transition: reducedMotion ? 'none' : `all ${ANIMATION_TIMING.STANDARD} ${EASING.EASE_IN_OUT}`,
        }}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{currentStepData.title}</span>
              {currentStepData.description && (
                <span className="text-sm font-normal text-muted-foreground">
                  {currentStepData.description}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isValidating ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Validating...</span>
            </div>
          ) : (
            currentStepData.component
          )}
        </CardContent>

        {/* Navigation */}
        {showNavigation && (
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="flex items-center gap-2">
              {/* Save button */}
              {onSave && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await onSave();
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saveButtonText}
                </Button>
              )}

              {/* Auto-save indicator */}
              {autoSave && isSaving && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Saving...
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {/* Previous button */}
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isValidating}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {previousButtonText}
                </Button>
              )}

              {/* Next/Complete button */}
              <Button
                type="button"
                onClick={handleNext}
                disabled={isValidating || currentStepData.disabled}
              >
                {isValidating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isLastStep ? (
                  <CheckCircle className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4" />
                )}
                {isLastStep ? completeButtonText : nextButtonText}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Step summary (for completed steps) */}
      {completedSteps.size > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="mb-2 text-sm font-medium">Completed Steps</h4>
          <div className="space-y-2">
            {steps
              .filter((_, index) => completedSteps.has(index))
              .map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2 rounded-md bg-background p-2"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{step.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing multi-step form state
export function useMultiStepForm(steps: FormStep[], initialStep = 0) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const markStepCompleted = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const reset = () => {
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
  };

  return {
    currentStep,
    completedSteps,
    goToStep,
    nextStep,
    previousStep,
    markStepCompleted,
    reset,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
}
