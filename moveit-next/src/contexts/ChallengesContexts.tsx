import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie'
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number
}

interface ChallengesProvidesProps{
    children: ReactNode;
    level: number;
    currentExperience:number;
    challengesCompleted:number;
      
}

interface ChallengesContextData{
    level: number ;
    currentExperience: number ;
    challengesCompleted: number ;
    experienceToNextLevel: number;
    activeChallenge: Challenge;
    levelUp: () => void;
    startNewChallenge: () => void;
    resetChallenge: () => void;
    completeChallenge: () => void;
    closeLevelUpModal: () => void;
}

export const challengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ children, ...rest }: ChallengesProvidesProps){
    
    const [level , setLevel] = useState(rest.level ?? 1);
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
    const [challengesCompleted, setChallengesCompleded] = useState(rest.challengesCompleted ?? 0);

    const [activeChallenge, setActiveChallenge] = useState(null)
    const [isLevelUpModalOpen, setIsLevelModalOpen] = useState(false)
    
    const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

    useEffect(() => {
        Notification.requestPermission();
    }, [] )

    useEffect(() => {
        Cookies.set('level',String(level));
        Cookies.set('currentExperience',String(currentExperience));
        Cookies.set('challengesCompleted',String(challengesCompleted));
    }, [level, currentExperience, challengesCompleted])

    function levelUp(){
      setLevel(level + 1);
      setIsLevelModalOpen(true)
    }

    function closeLevelUpModal(){
        setIsLevelModalOpen(false)
}
    function startNewChallenge(){
        const randomChallengeIndex = Math.floor(Math.random() * challenges.length)
        const challenge = challenges[randomChallengeIndex];

        setActiveChallenge(challenge)

        new Audio('/notification.mp3').play();

        if(Notification.permission === 'granted'){
            new Notification('Novo Desafio 🎉', {
                body: `Valendo ${challenge.amount}xp`
            })
        }
    }

    function resetChallenge(){
        setActiveChallenge(null)
    }

    function completeChallenge(){
        if (!activeChallenge){
            return;
        }

        const { amount } = activeChallenge;
        
        let finalExperience = currentExperience + amount;

        if( finalExperience >= experienceToNextLevel) {
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }

        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengesCompleded(challengesCompleted + 1)
    }
    
    return(
        <challengesContext.Provider 
        value={{
            level,
            currentExperience,
            challengesCompleted, 
            levelUp,
            experienceToNextLevel,
            startNewChallenge,
            activeChallenge, 
            resetChallenge,
            completeChallenge,
            closeLevelUpModal,
            }}>
            {children }

            {isLevelUpModalOpen && <LevelUpModal />}
        </challengesContext.Provider>
    )

}