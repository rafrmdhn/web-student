import React from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface PotentialScores {
  academic_score: number;
  social_score: number;
  creative_score: number;
  leadership_score: number;
  technical_score: number;
}

interface PotentialRadarChartProps {
  scores: PotentialScores;
  height?: number;
}

export const PotentialRadarChart: React.FC<PotentialRadarChartProps> = ({
  scores,
  height = 280,
}) => {
  const data = [
    { dimension: 'Akademik', score: scores.academic_score },
    { dimension: 'Sosial', score: scores.social_score },
    { dimension: 'Kreatif', score: scores.creative_score },
    { dimension: 'Kepemimpinan', score: scores.leadership_score },
    { dimension: 'Teknis', score: scores.technical_score },
  ];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="74%" data={data}>
          <PolarGrid stroke="#D8E2DF" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#142220', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickCount={5}
          />
          <Tooltip
            formatter={(value: number) => [`${value} / 100`, 'Skor Potensi']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D8E2DF',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#142220',
            }}
          />
          <Radar
            name="Potensi"
            dataKey="score"
            stroke="var(--accent-primary)"
            strokeWidth={2.2}
            fill="var(--accent-primary)"
            fillOpacity={0.22}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
