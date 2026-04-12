import '@/styles/globals.scss';
import { AuthProvider } from '@/contexts/AuthContext';
import { DateRangeProvider } from '@/contexts/DateRangeContext';
import { FilterProvider } from '@/contexts/FilterContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DateRangeProvider>
          <FilterProvider>
            <Component {...pageProps} />
          </FilterProvider>
        </DateRangeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
