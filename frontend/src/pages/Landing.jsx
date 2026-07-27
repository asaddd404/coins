import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, 
  LineChart, 
  Users, 
  UserPlus, 
  CheckCircle, 
  GraduationCap, 
  Gift,
  ArrowRight,
  BookOpen,
  Languages,
  Calculator,
  Globe,
  Star,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const FadeInSection = ({ children, className = '' }) => {
  const domRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div ref={domRef} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
};

export default function Landing() {
  const { user } = useAuthStore();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/dashboard';
    if (user.role === 'teacher') return '/teacher/groups';
    return '/admin/courses';
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden relative">
      
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10">
        
        {/* Navigation / Header */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <span className="text-white font-black text-lg">Z</span>
            </div>
            <div className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Zaytuna Coin
            </div>
          </div>
          <div>
            {user ? (
              <Link to={getDefaultRoute()} className="btn-primary py-2 px-5 text-sm">
                В панель управления
              </Link>
            ) : (
              <div className="space-x-4 flex items-center">
                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                  Войти
                </Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Section 1: Hero */}
        <section className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6 relative">
          <div className="max-w-5xl mx-auto text-center">
            <FadeInSection>
              {/* Floating badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-8 text-blue-300 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Zaytuna Academy — учись и зарабатывай
              </div>
            </FadeInSection>

            <FadeInSection>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.1]">
                <span className="block text-slate-100 mb-2">Учись. Побеждай.</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400">
                  Получай награды.
                </span>
              </h1>
            </FadeInSection>
            
            <FadeInSection>
              <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                Подготовка к <span className="text-blue-400 font-semibold">SAT</span>, <span className="text-cyan-400 font-semibold">IELTS</span>, <span className="text-violet-400 font-semibold">NUET</span>, <span className="text-amber-400 font-semibold">ЕНТ</span> — с геймификацией и реальными призами за успехи в учёбе
              </p>
            </FadeInSection>

            <FadeInSection>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link to={getDefaultRoute()} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                    Вернуться в систему
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                      Войти <ArrowRight size={20} />
                    </Link>
                    <Link to="/register" className="glass-card hover:bg-white/10 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all w-full sm:w-auto text-center border-blue-500/20">
                      Создать аккаунт
                    </Link>
                  </>
                )}
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Section 2: Subjects */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
                Наши направления
              </h2>
              <p className="text-slate-400 text-center mb-16 text-lg max-w-2xl mx-auto">
                Zaytuna Academy готовит к поступлению в лучшие университеты мира
              </p>
            </FadeInSection>
            
            <div className="grid md:grid-cols-3 gap-6">
              <FadeInSection className="delay-100">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]">
                  <div className="w-14 h-14 bg-blue-500/15 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                    <GraduationCap size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">SAT & NUET</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Подготовка к международным экзаменам для поступления в зарубежные ВУЗы и Назарбаев Университет
                  </p>
                </div>
              </FadeInSection>

              <FadeInSection className="delay-200">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                  <div className="w-14 h-14 bg-cyan-500/15 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Languages size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">IELTS & English</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Курсы английского языка и подготовка к IELTS с носителями и опытными преподавателями
                  </p>
                </div>
              </FadeInSection>

              <FadeInSection className="delay-300">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]">
                  <div className="w-14 h-14 bg-violet-500/15 rounded-2xl flex items-center justify-center mb-6 text-violet-400 group-hover:scale-110 transition-transform">
                    <Calculator size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">ЕНТ & Математика</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Подготовка к ЕНТ, углублённая математика и русский язык для школьников
                  </p>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Section 3: How Gamification Works */}
        <section className="py-24 px-6 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
                Как работает <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Zaytuna Coin</span>
              </h2>
              <p className="text-slate-400 text-center mb-20 text-lg max-w-2xl mx-auto">
                Зарабатывай монеты за учёбу и обменивай на реальные призы
              </p>
            </FadeInSection>

            <div className="relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-violet-500/20 -translate-y-1/2 rounded-full" />
              
              <div className="grid md:grid-cols-4 gap-12 relative z-10">
                
                <FadeInSection className="delay-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      <UserPlus size={36} className="text-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-blue-400 mb-2">Шаг 1</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Регистрация</h4>
                    <p className="text-slate-400">Зарегистрируйся и подай заявку на курс</p>
                  </div>
                </FadeInSection>

                <FadeInSection className="delay-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <CheckCircle size={36} className="text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold text-cyan-400 mb-2">Шаг 2</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Обучение</h4>
                    <p className="text-slate-400">Учись и получай оценки от преподавателей</p>
                  </div>
                </FadeInSection>

                <FadeInSection className="delay-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <Star size={36} className="text-amber-400" />
                    </div>
                    <div className="text-xl font-bold text-amber-400 mb-2">Шаг 3</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Монеты</h4>
                    <p className="text-slate-400">Зарабатывай Zaytuna Coins за отличные оценки</p>
                  </div>
                </FadeInSection>

                <FadeInSection className="delay-400">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-violet-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                      <Gift size={36} className="text-violet-400" />
                    </div>
                    <div className="text-xl font-bold text-violet-400 mb-2">Шаг 4</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Награды</h4>
                    <p className="text-slate-400">Обменивай монеты на реальные призы в магазине</p>
                  </div>
                </FadeInSection>

              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Features */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
                Всё для успешного обучения
              </h2>
            </FadeInSection>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FadeInSection className="delay-100">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
                    <Gamepad2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">🎮 Геймификация</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Монеты, опыт, рейтинги — учёба превращается в увлекательную игру с реальными наградами
                  </p>
                </div>
              </FadeInSection>

              <FadeInSection className="delay-200">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-14 h-14 bg-blue-500/15 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                    <LineChart size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">📊 Полный контроль</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Менеджеры и учителя управляют группами, заявками и оценками в одном месте
                  </p>
                </div>
              </FadeInSection>

              <FadeInSection className="delay-300">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-14 h-14 bg-violet-500/15 rounded-2xl flex items-center justify-center mb-6 text-violet-400 group-hover:scale-110 transition-transform">
                    <Users size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">👨‍👩‍👧 Для родителей</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Родители видят прогресс ребёнка в реальном времени — оценки, рейтинг, достижения
                  </p>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Section 5: Stats */}
        <section className="py-24 px-6 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <FadeInSection className="delay-100 text-center">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2">
                  2900+
                </div>
                <div className="text-slate-400 font-medium">подписчиков</div>
              </FadeInSection>
              
              <FadeInSection className="delay-200 text-center">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 mb-2">
                  6+
                </div>
                <div className="text-slate-400 font-medium">направлений</div>
              </FadeInSection>

              <FadeInSection className="delay-300 text-center">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600 mb-2">
                  240+
                </div>
                <div className="text-slate-400 font-medium">публикаций</div>
              </FadeInSection>

              <FadeInSection className="delay-400 text-center">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
                  ∞
                </div>
                <div className="text-slate-400 font-medium">мотивации</div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Section 6: Footer CTA */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 to-transparent pointer-events-none" />
          
          <div className="max-w-3xl mx-auto relative z-10">
            <FadeInSection>
              <h2 className="text-4xl md:text-6xl font-black mb-8">
                Готовы начать?
              </h2>
              <p className="text-xl text-slate-300 mb-12">
                Присоединяйтесь к Zaytuna Academy и сделайте обучение увлекательным
              </p>
              
              {user ? (
                <Link to={getDefaultRoute()} className="btn-primary text-xl px-10 py-5 inline-block">
                  Открыть панель управления
                </Link>
              ) : (
                <Link to="/register" className="btn-primary text-xl px-10 py-5 inline-block shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-105">
                  Создать аккаунт
                </Link>
              )}
            </FadeInSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-black text-sm">Z</span>
              </div>
              <span className="text-slate-400 font-medium">Zaytuna Coin</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="https://www.instagram.com/zaytuna.academy/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> @zaytuna.academy
              </a>
              <span>📞 8775 7849090</span>
            </div>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Zaytuna Academy</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
