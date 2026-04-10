'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  showGrid?: boolean;
  showPoints?: boolean;
  showArea?: boolean;
  className?: string;
}

export function LineChart({
  data,
  height = 200,
  showGrid = true,
  showPoints = true,
  showArea = false,
  className,
}: LineChartProps) {
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
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  const padding = range * 0.1;

  const chartHeight = height - 40;
  const chartWidth = 100;
  const pointCount = data.length;
  const pointSpacing = chartWidth / (pointCount - 1);

  const getY = (value: number) => {
    if (range === 0) return chartHeight / 2;
    return chartHeight - ((value - minValue + padding) / (range + padding * 2)) * chartHeight;
  };

  const getX = (index: number) => index * pointSpacing;

  // Generate path for line
  let path = '';
  data.forEach((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    
    if (index === 0) {
      path += `M ${x} ${y} `;
    } else {
      path += `L ${x} ${y} `;
    }
  });

  // Generate path for area (if enabled)
  let areaPath = '';
  if (showArea && data.length > 0) {
    areaPath = path;
    areaPath += `L ${getX(data.length - 1)} ${chartHeight} `;
    areaPath += `L ${getX(0)} ${chartHeight} Z`;
  }

  // Calculate trend
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const trend = lastValue - firstValue;
  const trendPercentage = firstValue !== 0 ? (trend / firstValue) * 100 : 0;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500';

  return (
    <div className={cn('relative', className)}>
      {/* Trend indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">
          {data.length} data points
        </div>
        <div className={cn('flex items-center gap-1 text-sm', trendColor)}>
          <TrendIcon className="h-4 w-4" />
          <span>{trendPercentage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative" style={{ height }}>
        {/* Grid lines */}
        {showGrid && (
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 0.25, 0.5, 0.75, 1].map((position) => (
              <div
                key={position}
                className="border-t border-gray-200 dark:border-gray-800"
                style={{ top: `${position * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxValue.toLocaleString()}</span>
          <span>{minValue.toLocaleString()}</span>
        </div>

        {/* Chart SVG */}
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="ml-8"
        >
          {/* Area under line (if enabled) */}
          {showArea && areaPath && (
            <path
              d={areaPath}
              fill="url(#gradient)"
              fillOpacity="0.2"
            />
          )}

          {/* Line */}
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {showPoints && data.map((point, index) => {
            const x = getX(index);
            const y = getY(point.value);
            const isHovered = hoveredIndex === index;
            
            return (
              <g key={index}>
                {/* Hover line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1="0"
                    x2={x}
                    y2={chartHeight}
                    stroke="currentColor"
                    className="text-muted-foreground"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                )}

                {/* Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="currentColor"
                  className={point.color || 'text-primary'}
                  stroke="white"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 25}
                      y={y - 40}
                      width="50"
                      height="30"
                      rx="4"
                      fill="currentColor"
                      className="text-gray-900 dark:text-gray-100"
                    />
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      fill="white"
                      className="text-xs font-medium"
                    >
                      {point.value.toLocaleString()}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Gradient for area */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {data.map((point, index) => (
            <div
              key={index}
              className="text-center"
              style={{ width: `${100 / data.length}%` }}
            >
              {point.label}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {data.map((point, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: point.color || '#3b82f6' }}
            />
            <span className="text-xs">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
