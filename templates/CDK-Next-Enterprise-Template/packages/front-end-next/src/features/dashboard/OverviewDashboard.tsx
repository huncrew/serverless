import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface OverviewDashboardProps {
  results: any[];
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ results }) => {
  const Results = results;

  console.log('consling results', results);

  // Prepare data for visualizations
  const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 } as any;

  const themeCounts: { [key: string]: number } = {};
  const recommendations: Set<string> = new Set();

  Results.forEach((result: any) => {
    const { sentiment, themes, recommendations: recs = []} = result;

    // Count sentiments
    if (sentiment in sentimentCounts) {
      sentimentCounts[sentiment]++;
    } else {
      sentimentCounts['Neutral']++;
    }

    // Count themes
    themes.forEach((theme: string) => {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });

    // Collect recommendations
    recs.forEach((rec: string) => {
      recommendations.add(rec);
    });
  });

  // Prepare data for charts
  const sentimentData = Object.keys(sentimentCounts).map((key) => ({
    name: key,
    value: sentimentCounts[key],
  }));

  const themeData = Object.keys(themeCounts).map((key) => ({
    name: key,
    value: themeCounts[key],
  }));

  const COLORS = ['#0088FE', '#FFBB28', '#FF8042']; // Adjust as needed

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-primary">Dashboard Insights</h2>

      {/* Sentiment Distribution */}
      <div className="bg-card p-5 rounded-md">
        <h3 className="text-xl font-semibold text-primary">Sentiment Distribution</h3>
        <PieChart width={400} height={300}>
          <Pie data={sentimentData} dataKey="value" nameKey="name" outerRadius={100} label>
            {sentimentData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Top Themes */}
      <div className="bg-card p-5 rounded-md">
        <h3 className="text-xl font-semibold text-primary">Top Themes</h3>
        <ul className="list-disc ml-6 mt-3">
          {themeData
            .sort((a: any, b: any) => b.value - a.value)
            .slice(0, 5)
            .map((theme, index) => (
              <li key={index} className="text-foreground">
                {theme.name} ({theme.value} mentions)
              </li>
            ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-card p-5 rounded-md">
        <h3 className="text-xl font-semibold text-primary">Actionable Recommendations</h3>
        <ul className="list-disc ml-6 mt-3">
          {Array.from(recommendations).map((rec, index) => (
            <li key={index} className="text-foreground">
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Feedback Entries */}
      <div className="bg-card p-5 rounded-md">
        <h3 className="text-xl font-semibold text-primary">Feedback Entries</h3>
        <table className="min-w-full mt-3">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Feedback</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Sentiment</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Themes</th>
            </tr>
          </thead>
          <tbody>
            {Results.map((result: any, index: number) => (
              <tr key={index} className="border-t border-border">
                <td className="px-4 py-2 text-sm text-foreground">{result.feedbackText}</td>
                <td className="px-4 py-2 text-sm text-foreground">{result.sentiment}</td>
                <td className="px-4 py-2 text-sm text-foreground">{result.themes.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverviewDashboard;
