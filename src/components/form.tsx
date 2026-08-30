import React, { useState, type ChangeEvent, type SubmitEvent } from 'react';

export interface FormQuestion {
    id?: string;
    question: string;
    type: 'radio' | 'dropdown' | 'checkbox' | 'range' | 'text' | 'textarea' | 'multi' | string;
    subtypeM?: keyof typeof customMulti;
    subtypeT?: 'password' | 'email' | 'number' | 'tel' | string;
    options?: Record<string, string>;
    allowed?: string[];
    rows?: number;
    dependsOn?: {
        questionIndex: number;
        value: string;
    };
}

export interface FormSubmitData {
    values: Record<string, string>;
    isFlagged: boolean;
    disqualifications: Record<string, string>;
}

interface DynamicFormProps {
    schema: FormQuestion[];
    onSubmit: (data: FormSubmitData) => void;
    isScreen:boolean;
}

export const freq1 = {
    never: "Never",
    rarely: "Rarely",
    sometimes: "Sometimes",
    often: "Often",
    always: "Always"
};

export const freq2 = {
    never: "Never",
    rarely: "Less than once a month",
    sometimes: "Once a month",
    often: "2-3 times a month",
    v_often: "Weekly",
    always: "Daily"
};

export const customMulti = {
    freq1,
    freq2,
};

export default function FormForm({ schema, onSubmit, isScreen }: DynamicFormProps) {
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [disqualifications, setDisqualifications] = useState<Record<string, string>>({});

    if (!schema) throw new Error("Schema is required");

    const getFieldName = (q: FormQuestion, index: number) => q.id || `field_${index}`;

    // Handle generic change events for native form inputs (<input>, <select>, <textarea>)
    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Typed directly with React.SubmitEvent
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        const newDisqualifications: Record<string, string> = {};

        schema.forEach((q, index) => {
            const fieldName = getFieldName(q, index);

            if (q.dependsOn) {
                const parentQuestion = schema[q.dependsOn.questionIndex];
                const parentFieldName = getFieldName(parentQuestion, q.dependsOn.questionIndex);
                if (formValues[parentFieldName] !== q.dependsOn.value) return;
            }

            const val = formValues[fieldName];

            if (!val) {
                newErrors[fieldName] = 'This field is required.';
                return;
            }

            if (isScreen && q.allowed && q.allowed.length > 0 && !q.allowed.includes(val)) {
                newDisqualifications[fieldName] = `Selected option '${val}' for question '${q.question}' does not meet requirements.`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const isFlagged = isScreen ? Object.keys(newDisqualifications).length > 0 : false;

        setErrors({});
        setDisqualifications(newDisqualifications);
        setSubmitted(true);

        if (onSubmit) {
            onSubmit({
                values: formValues,
                isFlagged,
                disqualifications: newDisqualifications,
            });
        }
    };

    return (
        <div className="w-full my-8 p-6 bg-primary-900 text-primary-100 rounded-xl border border-primary-800 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {schema.map((q, index) => {
                    const fieldName = getFieldName(q, index);

                    if (index > 0) {
                        if (q.dependsOn) {
                            const targetQuestion = schema[q.dependsOn.questionIndex];
                            const targetField = getFieldName(targetQuestion, q.dependsOn.questionIndex);
                            if (formValues[targetField] !== q.dependsOn.value) return null;
                        } else if (q.question.toLowerCase().startsWith('if yes')) {
                            const prevQuestion = schema[index - 1];
                            const prevFieldName = getFieldName(prevQuestion, index - 1);
                            if (formValues[prevFieldName] !== 'yes' && formValues[prevFieldName] !== 'Yes') return null;
                        }
                    }

                    return (
                        <div key={fieldName} className="animate-in fade-in duration-150">
                            <label htmlFor={fieldName} className="block text-sm font-medium mb-2">
                                {q.question}
                            </label>

                            {/* Radio Group */}
                            {q.type === 'radio' && q.options && (
                                <div className="flex gap-4">
                                    {Object.entries(q.options).map(([optKey, optVal]) => {
                                        const isChecked = formValues[fieldName] === optVal || formValues[fieldName] === optKey;
                                        return (
                                            <label
                                                key={optKey}
                                                className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    isChecked
                                                        ? 'bg-secondary-600/30 border-secondary-500 text-secondary-200'
                                                        : 'bg-primary-800 border-primary-700 hover:border-primary-600 text-primary-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={fieldName}
                                                    value={optVal}
                                                    checked={isChecked}
                                                    onChange={handleInputChange}
                                                    className="sr-only"
                                                />
                                                <span className="capitalize font-medium">{optVal}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Dropdown Select */}
                            {q.type === 'dropdown' && q.options && (
                                <select
                                    id={fieldName}
                                    name={fieldName}
                                    value={formValues[fieldName] || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-3 rounded-lg bg-primary-800 border border-primary-700 text-primary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                                >
                                    <option value="" disabled>Select an option...</option>
                                    {Object.entries(q.options).map(([optKey, optVal]) => (
                                        <option className="bg-primary-900" key={optKey} value={optKey}>
                                            {optVal}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Text Input */}
                            {q.type === 'text' && (
                                <input
                                    type={q.subtypeT ?? "text"}
                                    id={fieldName}
                                    name={fieldName}
                                    value={formValues[fieldName] || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-3 rounded-lg bg-primary-800 border border-primary-700 text-primary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                                    placeholder="Type your answer..."
                                />
                            )}

                            {/* Textarea */}
                            {q.type === 'textarea' && (
                                <textarea
                                    id={fieldName}
                                    name={fieldName}
                                    value={formValues[fieldName] || ''}
                                    onChange={handleInputChange}
                                    rows={q.rows || 3}
                                    className="resize-y w-full p-3 rounded-lg bg-primary-800 border border-primary-700 text-primary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                                    placeholder="Type your answer..."
                                />
                            )}

                            {/* Multi / Frequency Radio Group */}
                            {q.type === 'multi' && q.subtypeM && customMulti[q.subtypeM] && (
                                <div className="flex gap-4">
                                    {Object.entries(customMulti[q.subtypeM]).map(([optKey, optVal]) => {
                                        const isChecked = formValues[fieldName] === optVal || formValues[fieldName] === optKey;
                                        return (
                                            <label
                                                key={optKey}
                                                className={`flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    isChecked
                                                        ? 'bg-secondary-600/30 border-secondary-500 text-secondary-200'
                                                        : 'bg-primary-800 border-primary-700 hover:border-primary-600 text-primary-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={fieldName}
                                                    value={optVal}
                                                    checked={isChecked}
                                                    onChange={handleInputChange}
                                                    className="sr-only"
                                                />
                                                <span className="capitalize font-medium">{optVal}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {errors[fieldName] && (
                                <p className="mt-2 text-xs text-rose-400">{errors[fieldName]}</p>
                            )}
                        </div>
                    );
                })}

                <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg bg-secondary-600 hover:bg-secondary-500 text-white font-medium transition-colors shadow-sm"
                >
                    Submit Form
                </button>
            </form>
        </div>
    );
}