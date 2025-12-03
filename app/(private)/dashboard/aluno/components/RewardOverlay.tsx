import { Trophy, Star, Sparkles } from "lucide-react";

const RewardOverlay = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xl animate-in fade-in duration-300" />
        
        <div className="relative flex flex-col items-center justify-center animate-in zoom-in-75 slide-in-from-bottom-5 duration-500 ease-out">
            
            <div className="absolute inset-0 bg-purple-400/20 blur-[80px] rounded-full animate-pulse" />

            <div className="relative z-10 mb-6 group">
                <Sparkles className="absolute -top-6 left-0 w-12 h-12 text-yellow-500 animate-pulse delay-75" />
                <Star className="absolute top-10 -right-8 w-8 h-8 text-purple-400 fill-purple-400 animate-bounce delay-100" />
                
                <Trophy 
                className="w-48 h-48 text-yellow-500 fill-yellow-400 drop-shadow-2xl transform transition-all animate-[bounce_2s_infinite]" 
                strokeWidth={1.5}
                />
            </div>

            <h2 className="relative z-10 text-5xl font-black text-purple-900 tracking-tighter drop-shadow-sm text-center uppercase">
            Parabéns!
            </h2>
            <p className="relative z-10 mt-2 text-2xl font-bold text-slate-600">
            Atividade concluída!
            </p>
        </div>
        </div>
    );
}

export default RewardOverlay;