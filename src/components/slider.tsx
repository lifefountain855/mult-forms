interface Props {
    value:any,
    onChange?:Function,
    id:string,
    rangeOps:{
        min:number,
        max:number,
        step?:number,
        label?:string,
        numAdd?:string
    }
}

export default function SingleRangeSlider({ value = 50, onChange, id, rangeOps }:Props) {
  const handleChange = (e:any) => {
    const newValue = Number(e.target.value);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full p-3 rounded-lg bg-primary-800 border border-primary-700 text-primary-200">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="text-sm">
          {rangeOps.label ||"Value"}
        </label>
        <span className="text-sm font-mono bg-secondary-800 text-accent-200 px-2 py-0.5 rounded">
          {rangeOps.numAdd ? (rangeOps.numAdd.replace("$$",value)) : (value)}
        </span>
      </div>
      
      <input
        id={id}
        type="range"
        min={rangeOps.min}
        max={rangeOps.max}
        step={rangeOps.step || 1}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-primary-900 rounded-lg appearance-none cursor-pointer
                   accent-accent-600 focus:outline-none focus:ring-2 focus:ring-secondary-700
                   [&::-webkit-slider-thumb]:appearance-none 
                   [&::-webkit-slider-thumb]:h-5 
                   [&::-webkit-slider-thumb]:w-5 
                   [&::-webkit-slider-thumb]:rounded-full 
                   [&::-webkit-slider-thumb]:bg-accent-600
                   [&::-webkit-slider-thumb]:shadow-md
                   [&::-webkit-slider-thumb]:transition-all
                   [&::-webkit-slider-thumb]:hover:scale-110
                   [&::-moz-range-thumb]:appearance-none
                   [&::-moz-range-thumb]:h-5
                   [&::-moz-range-thumb]:w-5
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-accent-600
                   [&::-moz-range-thumb]:border-none"
      />
    </div>
  );
}