'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  donut?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  className?: string;
}

export function PieChart({
  data,
  donut = false,
  showLegend = true,
  showValues = true,
  className,
}: PieChartProps) {
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

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const center = 100;
  const donutRadius = donut ? 40 : 0;
  
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / totalValue) * 100;
    const angle = (item.value / totalValue) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Convert angles to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    // Calculate points for the arc
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    // Calculate points for inner circle (for donut)
    const x3 = center + donutRadius * Math.cos(endRad);
    const y3 = center + donutRadius * Math.sin(endRad);
    const x4 = center + donutRadius * Math.cos(startRad);
    const y4 = center + donutRadius * Math.sin(startRad);

    // Create path
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    let path;
    if (donut) {
      path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${donutRadius} ${donutRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
      `;
    } else {
      path = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
    }

    // Calculate label position
    const midAngle = startAngle + angle / 2;
    const midRad = (midAngle - 90) * (Math.PI / 180);
    const labelRadius = radius * 0.7;
    const labelX = center + labelRadius * Math.cos(midRad);
    const labelY = center + labelRadius * Math.sin(midRad);

    return {
      ...item,
      index,
      percentage,
      angle,
      startAngle,
      endAngle,
      path,
      labelX,
      labelY,
      isHovered: hoveredIndex === index,
    };
  });

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Chart container */}
      <div className="relative">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="transform -rotate-90"
        >
          {segments.map((segment) => (
            <g key={segment.index}>
              {/* Segment */}
              <path
                d={segment.path}
                fill={segment.color || '#3b82f6'}
                className={cn(
                  'transition-all duration-200',
                  segment.isHovered && 'opacity-90 brightness-110'
                )}
                onMouseEnter={() => setHoveredIndex(segment.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Percentage label */}
              {showValues && segment.percentage > 5 && (
                <text
                  x={segment.labelX}
                  y={segment.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  className="text-xs font-bold transform rotate-90"
                  transform={`rotate(90, ${segment.labelX}, ${segment.labelY})`}
                >
                  {segment.percentage.toFixed(0)}%
                </text>
              )}
            </g>
          ))}

          {/* Center text for donut chart */}
          {donut && (
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold fill-foreground"
              transform="rotate(90, 100, 100)"
            >
              {totalValue.toLocaleString()}
            </text>
          )}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
              <div className="font-semibold">{data[hoveredIndex].label}</div>
              <div className="text-xs text-gray-300">
                {data[hoveredIndex].value.toLocaleString()} ({segments[hoveredIndex].percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 gap-2 w-full">
          {segments.map((segment) => (
            <div
              key={segment.index}
              className={cn(
                'flex items-center gap-2 p-2 rounded transition-colors',
                segment.isHovered && 'bg-muted'
              )}
              onMouseEnter={() => setHoveredIndex(segment.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segment.color || '#3b82f6' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {segment.label}
                </div>
                {showValues && (
                  <div className="text-xs text-muted-foreground">
                    {segment.value.toLocaleString()} ({segment.percentage.toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 text-center">
        <div className="text-sm text-muted-foreground">
          Total: {totalValue.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">
          {data.length} categories
        </div>
      </div>
    </div>
  );
}

// Donut chart is just a pie chart with donut=true
export function DonutChart(props: PieChartProps) {
  return <PieChart {...props} donut={true} />;
}
