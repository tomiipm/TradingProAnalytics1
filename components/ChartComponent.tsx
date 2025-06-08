import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { darkTheme } from '@/constants/colors';
import { fetchHistoricalMarketData } from '@/services/api';

interface ChartComponentProps {
  pair: string;
  type: 'BUY' | 'SELL';
}

const ChartComponent: React.FC<ChartComponentProps> = ({ pair, type }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch real historical data for the chart
        const historicalData = await fetchHistoricalMarketData(pair, 30);
        
        if (!historicalData || historicalData.length === 0) {
          throw new Error('No historical data available');
        }
        
        // Process data for chart
        const labels = historicalData.slice(0, 7).map((item: any) => {
          const date = new Date(item.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }).reverse();
        
        const prices = historicalData.slice(0, 7).map((item: any) => item.price).reverse();
        
        setChartData({
          labels,
          datasets: [
            {
              data: prices,
              color: (opacity = 1) => type === 'BUY' ? `rgba(76, 175, 80, ${opacity})` : `rgba(244, 67, 54, ${opacity})`,
              strokeWidth: 2
            }
          ],
          legend: [pair]
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('Failed to load chart data');
        setIsLoading(false);
      }
    };
    
    loadChartData();
  }, [pair, type]);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkTheme.accent} />
        <Text style={styles.loadingText}>Loading chart data...</Text>
      </View>
    );
  }
  
  if (error || !chartData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Failed to load chart'}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: darkTheme.cardBackground,
          backgroundGradientFrom: darkTheme.cardBackground,
          backgroundGradientTo: darkTheme.cardBackground,
          decimalPlaces: pair === 'US30' ? 0 : pair === 'XAU/USD' ? 2 : 4,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: type === 'BUY' ? darkTheme.buy : darkTheme.sell
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: darkTheme.secondaryText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: darkTheme.danger,
    textAlign: 'center',
    padding: 20,
  }
});

export default ChartComponent;