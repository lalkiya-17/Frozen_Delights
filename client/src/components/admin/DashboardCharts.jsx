import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const DashboardCharts = ({ revenueData, orderStatusData, loading }) => {
    
    // Custom Tooltip for Revenue Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>{label}</p>
                    <p style={{ margin: 0, color: 'var(--primary)' }}>
                        Revenue: ₹{payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    const COLORS = ['#FF4D6D', '#59C3C3', '#FFD166', '#8338ec', '#3a86ff'];

    if (loading) {
        return (
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr', 
                gap: '1.5rem', 
                marginBottom: '2rem',
                minHeight: '300px'
            }}>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading Charts...
                </div>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="charts-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: '1.5rem', 
            marginBottom: '2rem' 
        }}>
            {/* Revenue Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Revenue Overview</h3>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={revenueData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                stroke="var(--text-secondary)" 
                                tick={{fill: 'var(--text-secondary)'}}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                stroke="var(--text-secondary)" 
                                tick={{fill: 'var(--text-secondary)'}}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `₹${value/1000}k`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="var(--primary)" 
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Order Status Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Order Status</h3>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={orderStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {orderStatusData?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    background: 'var(--bg-card)', 
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px'
                                }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
