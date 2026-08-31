import React, { useState, type ChangeEvent, type SubmitEvent } from 'react';
import SingleRangeSlider from './slider';

export interface FormQuestion {
    id?: string;
    question: string;
    type: 'radio' | 'dropdown' | 'checkbox' | 'range' | 'text' | 'textarea' | 'multi' | string;
    subtypeM?: keyof typeof customMulti;
    subtypeT?: 'password' | 'email' | 'number' | 'tel' | string;
    options?: Record<string, string>;
    allowed?: string[];
    rows?: number;
    rangeOps:{
        min:number,
        max:number,
        step?:number,
        label?:string,
        numAdd?:string
    };
    dependsOn?: {
        questionIndex: number;
        value: string;
    };
}

export interface FormSubmitData {
    values: Record<string, any>;
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
    // Allows values to be string, number, or string[] for multi-select checkboxes
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [disqualifications, setDisqualifications] = useState<Record<string, string>>({});

    if (!schema) throw new Error("Schema is required");

    const getFieldName = (q: FormQuestion, index: number) => q.id || `field_${index}`;

    // Handle generic single-value input changes
    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Handle array toggling specifically for multi-select checkboxes
    const handleCheckboxToggle = (fieldName: string, value: string) => {
        setFormValues((prev) => {
            const currentValues: string[] = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
            const exists = currentValues.includes(value);

            const updatedValues = exists
                ? currentValues.filter((v) => v !== value) // Remove item if already checked
                : [...currentValues, value];              // Add item if unchecked

            return {
                ...prev,
                [fieldName]: updatedValues,
            };
        });

        if (errors[fieldName]) {
            setErrors((prev) => ({ ...prev, [fieldName]: '' }));
        }
    };

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

            // Validation check for empty single inputs or empty multi-select arrays
            if (!val || (Array.isArray(val) && val.length === 0)) {
                newErrors[fieldName] = 'This field is required.';
                return;
            }

            if (isScreen && q.allowed && q.allowed.length > 0) {
                if (Array.isArray(val)) {
                    const hasInvalid = val.some((v) => !q.allowed?.includes(v));
                    if (hasInvalid) {
                        newDisqualifications[fieldName] = `Selected options for question '${q.question}' do not meet requirements.`;
                    }
                } else if (!q.allowed.includes(val)) {
                    newDisqualifications[fieldName] = `Selected option '${val}' for question '${q.question}' does not meet requirements.`;
                }
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
        <div className="w-full my-2 p-6 bg-primary-900 text-primary-100 rounded-xl border border-primary-800 shadow-xl max-w-3xl">
            { isScreen && (
                <div className="w-full flex justify-center"><span className='text-xl text-red-300 mb-5 -mt-3'>Screening Questions</span></div>
            )}
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
                                                    id={fieldName}
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

                            {/* Multi-Select Checkbox Group */}
                            {q.type === 'checkbox' && q.options && (
                                <div className="flex flex-wrap gap-4">
                                    {Object.entries(q.options).map(([optKey, optVal]) => {
                                        const selectedList: string[] = Array.isArray(formValues[fieldName])
                                            ? formValues[fieldName]
                                            : [];
                                            
                                        // Checks if either key or value is inside the array
                                        const isChecked = selectedList.includes(optVal) || selectedList.includes(optKey);

                                        return (
                                            <label
                                                key={optKey}
                                                className={`flex-grow w-auto max-w-md min-w-[140px] flex items-center justify-start px-4 py-2 rounded-lg border cursor-pointer transition-colors gap-3 select-none ${
                                                    isChecked
                                                        ? 'bg-secondary-600/30 border-secondary-500 text-secondary-200'
                                                        : 'bg-primary-800 border-primary-700 hover:border-primary-600 text-primary-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    name={fieldName}
                                                    value={optVal}
                                                    checked={isChecked}
                                                    onChange={() => handleCheckboxToggle(fieldName, optVal)}
                                                    className="sr-only"
                                                />
                                                {/* Open vs Filled Indicator */}
                                                <span
                                                    className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded border transition-all ${
                                                        isChecked
                                                            ? 'bg-secondary-500 border-secondary-500'
                                                            : 'bg-transparent border-primary-600'
                                                    }`}
                                                >
                                                    {isChecked && (
                                                        <svg
                                                            className="w-3.5 h-3.5 text-white"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className="truncate min-w-0 capitalize font-medium">{optVal}</span>
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

                            {q.type === 'range' && (
                                <SingleRangeSlider 
                                    value={formValues[fieldName] || 0} 
                                    onChange={(newValue:any) => {
                                        setFormValues((prev) => ({
                                            ...prev,
                                            [fieldName]: newValue
                                        }));
                                    }}
                                    rangeOps={q.rangeOps}
                                    id={fieldName || "slider_"+index}
                                />
                            )}

                            {/* Multi / Frequency Radio Group */}
                            {q.type === 'multi' && q.subtypeM && customMulti[q.subtypeM] && (
                                <div className="flex flex-col md:flex-row gap-4">
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