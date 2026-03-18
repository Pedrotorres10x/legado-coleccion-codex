import { useState, useMemo } from "react";
import { Calculator, TrendingUp, Euro, Calendar, Shield, Phone } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/contexts/LanguageContext";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

const MortgageCalculator = () => {
  const { t } = useTranslation();
  const [price, setPrice] = useState(250000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(3.5);
  const [years, setYears] = useState(25);

  const result = useMemo(() => {
    const downPayment = price * (downPaymentPct / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = years * 12;
    if (monthlyRate === 0) return { monthly: loanAmount / totalPayments, total: loanAmount, interest: 0, loanAmount, downPayment };
    const monthly = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return { monthly, total: monthly * totalPayments, interest: monthly * totalPayments - loanAmount, loanAmount, downPayment };
  }, [price, downPaymentPct, interestRate, years]);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.05),transparent_70%)]" />
      <div className="container relative z-10">
        <div className="text-center mb-16 enter-fade-up">
          <span className="text-primary font-medium tracking-widest uppercase text-sm">{t("mortgage.tag")}</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-3 text-foreground">
            {t("mortgage.title")} <span className="text-gradient-gold">{t("mortgage.title2")}</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{t("mortgage.desc")}</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 enter-fade-up">
          <div className="bg-white rounded-2xl p-8 space-y-8 border border-border shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Euro className="w-4 h-4 text-primary" /> {t("mortgage.price")}</label>
                <span className="text-primary font-semibold text-sm">{formatCurrency(price)}</span>
              </div>
              <Slider value={[price]} onValueChange={(v) => setPrice(v[0])} min={50000} max={2000000} step={5000} className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>50.000 €</span><span>2.000.000 €</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> {t("mortgage.down")} ({downPaymentPct}%)</label>
                <span className="text-primary font-semibold text-sm">{formatCurrency(result.downPayment)}</span>
              </div>
              <Slider value={[downPaymentPct]} onValueChange={(v) => setDownPaymentPct(v[0])} min={0} max={80} step={1} className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0%</span><span>80%</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> {t("mortgage.interest")}</label>
                <Input type="number" value={interestRate} onChange={(e) => setInterestRate(Math.max(0, Math.min(15, Number(e.target.value))))} step={0.1} min={0} max={15} className="w-20 h-8 text-right text-sm bg-white border-border" />
              </div>
              <Slider value={[interestRate]} onValueChange={(v) => setInterestRate(Math.round(v[0] * 10) / 10)} min={0} max={15} step={0.1} className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0%</span><span>15%</span></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {t("mortgage.years")}</label>
                <span className="text-primary font-semibold text-sm">{years}</span>
              </div>
              <Slider value={[years]} onValueChange={(v) => setYears(v[0])} min={5} max={40} step={1} className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>5</span><span>40</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[hsl(214_35%_14%)] rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-sm text-white/60 uppercase tracking-widest mb-2">{t("mortgage.monthly")}</span>
              <span className="font-serif text-5xl md:text-6xl font-bold text-gradient-gold">{formatCurrency(result.monthly)}</span>
              <span className="text-white/50 text-sm mt-2">{t("mortgage.month")}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 text-center border border-border shadow-sm">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("mortgage.financed")}</span>
                <p className="text-foreground font-semibold text-lg mt-1">{formatCurrency(result.loanAmount)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center border border-border shadow-sm">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("mortgage.downPayment")}</span>
                <p className="text-foreground font-semibold text-lg mt-1">{formatCurrency(result.downPayment)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center border border-border shadow-sm">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("mortgage.totalInterest")}</span>
                <p className="text-primary font-semibold text-lg mt-1">{formatCurrency(result.interest)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center border border-border shadow-sm">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("mortgage.totalPay")}</span>
                <p className="text-foreground font-semibold text-lg mt-1">{formatCurrency(result.total)}</p>
              </div>
            </div>

            {/* Trust badge */}
            <div className="bg-white rounded-xl p-5 flex items-center gap-4 border border-border shadow-sm">
              <Shield className="w-8 h-8 text-primary shrink-0" />
              <div className="text-left">
                <p className="text-foreground text-sm font-semibold leading-tight">Intermediarios autorizados por el Banco de España</p>
                <p className="text-muted-foreground text-xs mt-1">Gestionamos tu hipoteca de principio a fin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MortgageCalculator;
