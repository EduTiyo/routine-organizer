"use client";

import { useEffect, useState } from "react";
import { Trophy, Home, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import confetti from "canvas-confetti";

interface SuccessPageProps {
  onReset?: () => void;
}

const SuccessPage = ({ onReset }: SuccessPageProps) => {
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    setTimeout(() => setShowReward(true), 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] p-4 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 drop-shadow-sm uppercase tracking-wider">
          Vitória!
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          Rotina finalizada com sucesso
        </p>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
        
        <Trophy 
          strokeWidth={1}
          className="w-64 h-64 md:w-80 md:h-80 text-yellow-400 drop-shadow-2xl filter transform transition-transform duration-700 hover:scale-110 hover:rotate-6" 
        />
        
        <Star className="absolute top-0 right-10 w-12 h-12 text-yellow-300 animate-bounce fill-yellow-300" style={{ animationDelay: '0.1s' }} />
        <Star className="absolute bottom-10 left-0 w-8 h-8 text-yellow-500 animate-pulse fill-yellow-500" style={{ animationDelay: '0.3s' }} />
        <Star className="absolute top-20 -left-4 w-10 h-10 text-amber-300 animate-bounce fill-amber-300" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className={`transition-all duration-1000 transform ${showReward ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Card className="bg-gradient-to-br from-amber-900 to-amber-700 border-4 border-amber-600 p-6 rounded-3xl shadow-xl max-w-sm mx-auto relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer">
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
            
            <div className="flex items-center gap-4 relative z-10">
                <div className="text-6xl filter drop-shadow-lg">
                    🍫
                </div>
                <div className="text-left">
                    <h3 className="text-amber-100 font-bold text-lg uppercase tracking-wide">Recompensa Desbloqueada</h3>
                    <p className="text-amber-200 text-sm font-medium">Você merece esse chocolate!</p>
                </div>
            </div>
        </Card>
      </div>

      <div className="pt-8">
        <Button 
          size="lg" 
          onClick={onReset}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl px-12 py-8 rounded-full shadow-lg hover:shadow-emerald-500/50 transition-all active:scale-95"
        >
          <Home className="mr-3 w-6 h-6" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;