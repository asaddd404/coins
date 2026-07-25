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
  ArrowRight
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
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative">
      
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        
        {/* Navigation / Header */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
            Acaddem
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
        <section className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6 relative bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInSection>
              <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
                <span className="block text-slate-100 mb-2">Новый уровень</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                  образования
                </span>
              </h1>
            </FadeInSection>
            
            <FadeInSection>
              <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                Современная платформа для образовательных центров с геймификацией
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
                    <Link to="/login" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2">
                      Войти <ArrowRight size={20} />
                    </Link>
                    <Link to="/register" className="glass-card hover:bg-white/10 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all w-full sm:w-auto text-center">
                      Регистрация
                    </Link>
                  </>
                )}
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Section 2: Features */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
                Всё для успешного обучения
              </h2>
            </FadeInSection>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FadeInSection className="delay-100">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                  <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                    <Gamepad2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">🎮 Геймификация</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Монеты, опыт, рейтинги — мотивация через игровые механики. Учитесь с удовольствием.
                  </p>
                </div>
              </FadeInSection>

              <FadeInSection className="delay-200">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                    <LineChart size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">📊 Полный контроль</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Аудит оценок, управление группами, заявки — всё в одном месте для менеджеров и учителей.
                  </p>
                </div>
              </FadeInSection>

              <FadeInSection className="delay-300">
                <div className="glass-card p-8 h-full group hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                  <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
                    <Users size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">👨‍👩‍👧 Для родителей</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Родители видят прогресс ребёнка в реальном времени, могут отслеживать оценки и достижения.
                  </p>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Section 3: How It Works */}
        <section className="py-24 px-6 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <FadeInSection>
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-20">
                Как это работает
              </h2>
            </FadeInSection>

            <div className="relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/20 via-emerald-500/20 to-indigo-500/20 -translate-y-1/2 rounded-full" />
              
              <div className="grid md:grid-cols-4 gap-12 relative z-10">
                
                <FadeInSection className="delay-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                      <UserPlus size={36} className="text-indigo-400" />
                    </div>
                    <div className="text-xl font-bold text-indigo-400 mb-2">Шаг 1</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Регистрация</h4>
                    <p className="text-slate-400">Ученик создаёт аккаунт на платформе</p>
                  </div>
                </FadeInSection>

                <FadeInSection className="delay-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <CheckCircle size={36} className="text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold text-emerald-400 mb-2">Шаг 2</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Модерация</h4>
                    <p className="text-slate-400">Менеджер проверяет и активирует аккаунт</p>
                  </div>
                </FadeInSection>

                <FadeInSection className="delay-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <GraduationCap size={36} className="text-amber-400" />
                    </div>
                    <div className="text-xl font-bold text-amber-400 mb-2">Шаг 3</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Обучение</h4>
                    <p className="text-slate-400">Учитель выставляет оценки, ученик получает XP и монеты</p>
                  </div>
                </FadeInSection>

                <FadeInSection className="delay-400">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-800 border-2 border-pink-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                      <Gift size={36} className="text-pink-400" />
                    </div>
                    <div className="text-xl font-bold text-pink-400 mb-2">Шаг 4</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Награды</h4>
                    <p className="text-slate-400">Ученик тратит монеты в магазине на реальные призы</p>
                  </div>
                </FadeInSection>

              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Stats Counter */}
        <section className="py-24 px-6 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <FadeInSection className="delay-100 text-center">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600 mb-2">
                  50+
                </div>
                <div className="text-slate-400 font-medium">учеников</div>
              </FadeInSection>
              
              <FadeInSection className="delay-200 text-center">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mb-2">
                  6
                </div>
                <div className="text-slate-400 font-medium">курсов</div>
              </FadeInSection>

              <FadeInSection className="delay-300 text-center">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
                  1000+
                </div>
                <div className="text-slate-400 font-medium">оценок</div>
              </FadeInSection>

              <FadeInSection className="delay-400 text-center">
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600 mb-2">
                  ∞
                </div>
                <div className="text-slate-400 font-medium">мотивации</div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Section 5: Footer CTA */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/50 to-transparent pointer-events-none" />
          
          <div className="max-w-3xl mx-auto relative z-10">
            <FadeInSection>
              <h2 className="text-4xl md:text-6xl font-black mb-8">
                Готовы начать?
              </h2>
              <p className="text-xl text-slate-300 mb-12">
                Присоединяйтесь к платформе и сделайте процесс обучения увлекательным и эффективным.
              </p>
              
              {user ? (
                <Link to={getDefaultRoute()} className="btn-primary text-xl px-10 py-5 inline-block">
                  Открыть панель управления
                </Link>
              ) : (
                <Link to="/register" className="btn-primary text-xl px-10 py-5 inline-block shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:scale-105">
                  Создать аккаунт
                </Link>
              )}
            </FadeInSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-white/10 text-slate-500">
          <p>© {new Date().getFullYear()} Acaddem. Все права защищены.</p>
        </footer>

      </div>
    </div>
  );
}
