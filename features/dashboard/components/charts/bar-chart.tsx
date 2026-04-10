'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  horizontal = false,
  className,
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          No data available
        </div>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const totalValue = values.reduce((sum, val) => sum + val, 0);

  if (horizontal) {
    return (
      <div className={cn('space-y-2', className)}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const isHovered = hoveredIndex === index;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                {showValues && (
                  <span className="text-sm text-muted-foreground">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div
                className="relative h-4 bg-muted rounded-full overflow-hidden"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isHovered && 'brightness-110'
                  )}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || '#3b82f6',
                  }}
                />
                {isHovered && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bar chart
  const barCount = data.length;
  const barWidth = 100 / barCount;
  const chartHeight = height - 40;

  return (
    <div className={cn('relative', className)}>
      {/* Chart container */}
      <div className="relative" style={{ height }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 0.25, 0.5, 0.75, 1].map((position) => (
            <div
              key={position}
              className="border-t border-gray-200 dark:border-gray-800"
              style={{ top: `${position * 100}%` }}
            />
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxValue.toLocaleString()}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="flex items-end h-full ml-8">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100;
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={index}
                className="relative flex flex-col items-center"
                style={{ width: `${barWidth}%` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Bar */}
                <div
                  className={cn(
                    'w-3/4 rounded-t transition-all duration-300',
                    isHovered && 'brightness-110'
                  )}
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: item.color || '#3b82f6',
                    minHeight: '4px',
                  }}
                >
                  {/* Value label on hover */}
                  {isHovered && showValues && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.value.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* X-axis label */}
                <div className="mt-2 text-xs text-muted-foreground truncate w-full text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div>
          <span className="text-muted-foreground">Total: </span>
          <span className="font-medium">{totalValue.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Avg: </span>
          <span className="font-medium">
            {(totalValue / data.length).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
