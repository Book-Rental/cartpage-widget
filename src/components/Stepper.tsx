export interface Step {
    key: string;
    label: string;
}

export interface StepperProps {
    steps: Step[];
    currentStep: string;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
        <div className="flex w-full items-center px-1 py-4">
            {steps.map((step, idx) => {
                const isCompleted = idx < currentIndex;
                const isActive = idx === currentIndex;

                return (
                    <div key={step.key} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
                                    ${isCompleted
                                        ? "bg-green-500 text-white"
                                        : isActive
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {isCompleted ? "✓" : idx + 1}
                            </div>
                            <span
                                className={`mt-1 whitespace-nowrap text-xs ${isActive ? "font-semibold text-gray-900" : "text-gray-500"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {idx < steps.length - 1 && (
                            <div
                                className={`mx-2 h-0.5 flex-1 ${isCompleted ? "bg-green-500" : "bg-gray-200"
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}