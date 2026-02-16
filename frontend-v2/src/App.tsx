import { LanguageProvider } from './i18n/LanguageContext.tsx';
import { CalculatorProvider } from './components/calculator/CalculatorProvider.tsx';
import Header from './components/calculator/Header.tsx';
import PatientParametersCard from './components/calculator/PatientParametersCard.tsx';
import CurrentRegimenCard from './components/calculator/CurrentRegimenCard.tsx';
import TargetRegimenCard from './components/calculator/TargetRegimenCard.tsx';
import ResultsCard from './components/calculator/ResultsCard.tsx';
import Footer from './components/calculator/Footer.tsx';

export default function App() {
  return (
    <LanguageProvider>
      <CalculatorProvider>
        <div className="min-h-screen bg-slate-50">
          <Header />
          <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            <PatientParametersCard />
            <CurrentRegimenCard />
            <TargetRegimenCard />
            <ResultsCard />
          </main>
          <Footer />
        </div>
      </CalculatorProvider>
    </LanguageProvider>
  );
}
