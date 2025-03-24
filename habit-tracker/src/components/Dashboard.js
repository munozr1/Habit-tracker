/**
 * Dashboard Component
 *
 * This file implements the Dashboard component for the application.
 * It provides an interactive dashboard that includes:
 * - A sidebar with navigation options.
 * - A header displaying user information.
 * - Various cards that display key metrics:
 *    • A progress overview using a responsive chart (Line, Bar) showing all available data.
 *    • A leaderboard ranking users based on performance.
 *    • A section for achievements and milestones.
 *    • A task list for managing activities.
 *    • A streak counter for tracking consistency.
 *    • Habit category progress with stages.
 *
 * The component utilizes React hooks (useState, useEffect, useRef) for state management
 * and side effects. It employs styled-components for CSS-in-JS styling and 
 * integrates with Recharts for data visualization.
 *
 * It also interacts with authentication context (useAuth) and habit context (useHabit) 
 * to fetch the current user's details and habit progress.
 *
 * 🔍 Simulated asynchronous functions (e.g., fetchUserData, fetchLeaderboardData) 
 * are used to mimic API requests.
 *
 * The code follows a modular structure, ensuring readability and maintainability.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useHabit } from '../context/HabitContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';

const HABIT_CATEGORIES = [
  { id: 'addiction', name: 'Addiction Recovery', icon: '🚭', description: 'Break free from harmful dependencies', stages: [
    { level: 1, goal: 'First Week Clean', points: 50, reward: 'Self-Care Package' },
    { level: 2, goal: 'One Month Milestone', points: 200, reward: 'Wellness Session' },
    { level: 3, goal: 'Quarterly Achievement', points: 500, reward: 'Personal Experience Gift' },
  ]},
  { id: 'fitness', name: 'Fitness Transformation', icon: '💪', description: 'Build a healthier, stronger you', stages: [
    { level: 1, goal: 'Consistent Workouts', points: 75, reward: 'Healthy Meal Coupon' },
    { level: 2, goal: 'Nutrition Tracking', points: 250, reward: 'Fitness Gear' },
    { level: 3, goal: 'Body Composition Change', points: 600, reward: 'Personal Training' },
  ]},
];

const floatAnimation = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const starGlow = keyframes`
  0% { opacity: 0.6; filter: blur(1px); }
  50% { opacity: 1; filter: blur(0px); }
  100% { opacity: 0.6; filter: blur(1px); }
`;

const slowRotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const trailAnimation = keyframes`
  0% { opacity: 0; transform: translateX(20px); }
  20% { opacity: 0.7; }
  100% { opacity: 0; transform: translateX(-100px); }
`;

const pulseGlow = keyframes`
  0% { transform: scale(1); opacity: 0.6; box-shadow: 0 0 10px rgba(100, 220, 255, 0.5); }
  50% { transform: scale(1.05); opacity: 0.8; box-shadow: 0 0 20px rgba(100, 220, 255, 0.8); }
  100% { transform: scale(1); opacity: 0.6; box-shadow: 0 0 10px rgba(100, 220, 255, 0.5); }
`;

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${theme.colors.background};
  overflow: hidden;
`;

const GradientOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 50%, rgba(114, 137, 218, 0.15) 0%, transparent 70%),
              radial-gradient(circle at 70% 70%, rgba(90, 128, 244, 0.1) 0%, transparent 60%);
  z-index: 1;
`;

const Scenery = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(180deg, transparent 0%, rgba(11, 38, 171, 0.2) 100%);
  z-index: 1;
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 5%;
    width: 30%;
    height: 80%;
    background: linear-gradient(135deg, #3b4874 20%, #2b3a67 100%);
    clip-path: polygon(0% 100%, 50% 30%, 100% 100%);
  }
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 15%;
    width: 40%;
    height: 90%;
    background: linear-gradient(135deg, #2b3a67 20%, #1a2233 100%);
    clip-path: polygon(0% 100%, 40% 20%, 80% 60%, 100% 100%);
  }
`;

const Star = styled.div`
  position: absolute;
  width: ${props => props.size || '30px'};
  height: ${props => props.size || '30px'};
  background: radial-gradient(circle, rgba(255, 210, 70, 0.9) 0%, rgba(255, 210, 70, 0) 70%);
  border-radius: 50%;
  z-index: 2;
  animation: ${starGlow} ${props => props.duration || '3s'} infinite ease-in-out;
  animation-delay: ${props => props.delay || '0s'};
  opacity: 0.7;
  &::before {
    content: '★';
    position: absolute;
    font-size: ${props => parseInt(props.size) * 0.8 || '24px'};
    color: rgba(255, 210, 70, 0.9);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const AchievementBadge = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(114, 137, 218, 0.2) 0%, rgba(114, 137, 218, 0) 70%);
  border: 2px solid rgba(114, 137, 218, 0.3);
  box-shadow: 0 0 15px rgba(114, 137, 218, 0.2);
  top: 15%;
  right: 15%;
  z-index: 2;
  animation: ${pulseGlow} 4s infinite ease-in-out;
  &::before {
    content: '🏆';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
  }
`;

const Rocket = styled.div`
  position: absolute;
  top: 30%;
  left: 15%;
  width: 50px;
  height: 50px;
  z-index: 3;
  animation: ${floatAnimation} 8s infinite ease-in-out;
  transform-origin: center center;
  &::before {
    content: '🚀';
    position: absolute;
    font-size: 28px;
    transform: rotate(45deg);
  }
`;

const RocketTrail = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  width: 80px;
  height: 8px;
  background: linear-gradient(90deg, rgba(100, 220, 255, 0) 0%, rgba(100, 220, 255, 0.7) 100%);
  border-radius: 4px;
  z-index: 2;
  opacity: 0.5;
  filter: blur(2px);
  transform: translateX(-80px);
  animation: ${trailAnimation} 2s infinite;
`;

const ProgressCircle = styled.div`
  position: absolute;
  bottom: 20%;
  right: 10%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(100, 220, 255, 0.2);
  border-top: 3px solid rgba(100, 220, 255, 0.8);
  animation: ${slowRotate} 8s linear infinite;
  z-index: 2;
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 2px dashed rgba(100, 220, 255, 0.2);
  }
`;

const XPOrb = styled.div`
  position: absolute;
  width: 15px;
  height: 15px;
  background: radial-gradient(circle, rgba(160, 232, 255, 0.6) 30%, rgba(160, 232, 255, 0) 70%);
  border-radius: 50%;
  animation: ${floatAnimation} ${props => props.duration || '4s'} infinite ease-in-out;
  animation-delay: ${props => props.delay || '0s'};
  opacity: 0.5;
  z-index: 2;
`;

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  color: ${theme.colors.text};
`;

const Sidebar = styled.div`
  width: 280px;
  padding: 2rem;
  background: rgba(30, 39, 73, 0.8);
  border-right: 1px solid ${theme.colors.borderWhite};
  backdrop-filter: blur(10px);
  z-index: 10;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  h2 {
    color: ${theme.colors.accent};
    font-size: 1.8rem;
    margin-bottom: 2rem;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 2rem;
`;

const NavItem = styled.li`
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  &.active {
    background: ${theme.colors.secondary};
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 3rem;
  margin-left: 20px;
  z-index: 10;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const UserGreeting = styled.div`
  h1 { font-size: 2.5rem; span { color: ${theme.colors.accent}; } }
`;

const LevelBadge = styled.div`
  background: ${theme.colors.secondary};
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  box-shadow: ${theme.shadows.card};
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: start;
  justify-content: start;
`;

const Card = styled.div`
  background: ${theme.colors.glassWhite};
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid ${theme.colors.borderWhite};
  backdrop-filter: blur(8px);
  transition: transform 0.2s ease;
  &:hover { transform: translateY(-2px); }
`;

const Button = styled.button`
  background: ${theme.colors.accent};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const LeaderboardList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1rem;
`;

const LeaderboardItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin: 0.5rem 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

const UserRank = styled.span`
  color: ${theme.colors.accent};
  font-weight: 600;
`;

const UserScore = styled.span`
  color: ${theme.colors.secondary};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 1rem;
  & div {
    width: ${props => props.progress || '30%'};
    height: 100%;
    background: ${theme.colors.accent};
    transition: width 0.3s ease;
  }
`;

const AddHabitInput = styled.input`
  width: calc(100% - 20px);
  padding: 8px;
  margin-top: 1rem;
  border: 1px solid ${theme.colors.borderWhite};
  border-radius: 8px;
`;

const AddHabitButton = styled.button`
  background: ${theme.colors.accent};
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 0.5rem;
  &:hover { background: ${theme.colors.secondary}; }
`;

const EditInput = styled.input`
  padding: 4px;
  margin-right: 8px;
  border: 1px solid ${theme.colors.borderWhite};
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: ${theme.colors.text};
`;

const DeleteButton = styled.button`
  background: rgba(255, 0, 0, 0.3);
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  &:hover { background: rgba(255, 0, 0, 0.5); }
`;

const ChartControls = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ChartTypeButton = styled.button`
  background: ${props => props.active ? theme.colors.accent : 'rgba(114, 137, 218, 0.2)'};
  color: ${theme.colors.text};
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${props => props.active ? theme.colors.accent : 'rgba(114, 137, 218, 0.3)'}; }
`;

const ChartContainer = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AchievementList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1rem;
`;

const AchievementItem = styled.li`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AchievementTitle = styled.span`
  color: ${theme.colors.accent};
  font-weight: 600;
`;

const AchievementDetails = styled.span`
  color: ${theme.colors.secondary};
`;

const LogoutButton = styled.button`
  background: ${theme.colors.secondary};
  color: white;
  border: 1px solid rgba(253, 3, 3, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  &:hover {
    background: ${theme.colors.accent};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TaskList = styled.ul`
  list-style: none;
  padding: 0;
`;

const Task = styled.li`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TaskCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.completed ? theme.colors.accent : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.completed ? theme.colors.accent : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &::after {
    content: ${props => props.completed ? '"✓"' : '""'};
    color: white;
    font-size: 0.8rem;
  }
  
  &:hover {
    border-color: ${theme.colors.accent};
    transform: scale(1.1);
  }
`;

const TaskText = styled.span`
  flex: 1;
  color: ${props => props.completed ? 'rgba(255, 255, 255, 0.5)' : '#ffffff'};
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
`;
;

// ... (keep all animations and styled components the same as in your second code)

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { progress, getStreak, getCategoryProgress, setStreak, updateProgress } = useHabit();
  const { events, addEvent, updateEvent, deleteEvent, toggleEventCompletion } = useEventContext();
  
  // State
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [streak, setLocalStreak] = useState(0);
  const inputRef = useRef(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Calculate total XP from progress and completed tasks
  const calculateTotalXP = useCallback(() => {
    const progressXP = Object.values(progress).reduce((sum, p) => sum + p, 0);
    
    // Add XP from completed tasks
    let tasksXP = 0;
    const todayKey = new Date().toISOString().split('T')[0];
    const todayTasks = events[todayKey] || [];
    tasksXP = todayTasks.filter(task => task.completed).length * 10; // 10 XP per completed task
    
    return progressXP + tasksXP;
  }, [progress, events]);

  const [totalXP, setTotalXP] = useState(calculateTotalXP());

  // Update total XP whenever progress or tasks change
  useEffect(() => {
    setTotalXP(calculateTotalXP());
  }, [calculateTotalXP]);

  const currentLevel = Math.floor(totalXP / 100) + 1;
  const levelProgress = totalXP % 100;
  const streakPercentage = Math.min((streak / 14) * 100, 100);

  const achievements = [
    { id: 1, title: 'First Week Streak', description: 'Completed 7 days of habits', earned: streak >= 7 },
    { id: 2, title: 'Milestone 100 XP', description: 'Reached 100 XP points', earned: totalXP >= 100 },
    { id: 3, title: 'Habit Master', description: 'Completed 3 habits consistently', earned: Object.keys(progress).length >= 3 },
    { id: 4, title: 'Task Champion', description: 'Completed 5 tasks in a day', earned: false }, // Example additional achievement
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchUserProgress = useCallback(async () => {
    try {
      setLoading(true);
      const userProgress = await fakeFetchUserData();
      setChartData(userProgress.map((item, index) => ({
        progress: getCategoryProgress(item.date) || item.progress,
      })));
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  }, [getCategoryProgress]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const leaderboardData = await fakeFetchLeaderboardData();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserProgress();
    const streakValue = getStreak();
    setLocalStreak(streakValue);
    setStreak(streakValue);
  }, [fetchLeaderboard, fetchUserProgress, getStreak, setStreak]);

  useEffect(() => {
    if (user && !leaderboard.some(entry => entry.name === user.name)) {
      setLeaderboard(prev => [...prev, { name: user.name, xp: totalXP }]);
    }
  }, [user, totalXP, leaderboard]);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.xp - a.xp);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const fakeFetchUserData = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          Array.from({ length: 7 }, (_, i) => ({
            date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
            progress: Math.floor(Math.random() * 10),
          }))
        );
      }, 1000);
    });
  };

  const fakeFetchLeaderboardData = async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([]);
      }, 1000);
    });
  };

  const addHabit = () => setShowInput(true);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newHabit.trim()) {
      const todayKey = new Date().toISOString().split('T')[0];
      addEvent(todayKey, { 
        id: Date.now(), 
        title: newHabit.trim(), 
        completed: false 
      });
      setNewHabit('');
      setShowInput(false);
    }
  };

  const handleTaskCompletion = async (taskId, completed) => {
    const todayKey = new Date().toISOString().split('T')[0];
    
    // Toggle task completion
    await toggleEventCompletion(todayKey, taskId, completed);
    
    // Add XP when task is completed
    if (completed) {
      // Update progress with 10 XP for each completed task
      await updateProgress('tasks', 10); // 'tasks' can be a category or you can use another key
    }
  };

  const toggleEdit = (taskId) => {
    const todayKey = new Date().toISOString().split('T')[0];
    const task = events[todayKey]?.find(t => t.id === taskId);
    if (task) {
      updateEvent(todayKey, taskId, { isEditing: !task.isEditing });
    }
  };

  const deleteTask = (taskId) => {
    const todayKey = new Date().toISOString().split('T')[0];
    deleteEvent(todayKey, taskId);
  };

  const getLineColor = (progress) => {
    if (progress < 40) return '#ff6b6b';
    if (progress < 70) return '#feca57';
    return '#1dd1a1';
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke={theme.colors.text} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="progress" fill={theme.colors.accent} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke={theme.colors.text} />
              <YAxis hide />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="progress"
                stroke={chartData.length ? getLineColor(chartData[chartData.length - 1]?.progress) : theme.colors.accent}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const todayKey = new Date().toISOString().split('T')[0];
  const todayTasks = events[todayKey] || [];

  return (
    <DashboardContainer>
      <Background>
        <GradientOverlay />
        <Scenery />
        <Star size="20px" style={{ top: '10%', left: '10%' }} duration="4s" delay="0.5s" />
        <Star size="15px" style={{ top: '25%', left: '25%' }} duration="3s" delay="1s" />
        <Star size="25px" style={{ top: '15%', right: '30%' }} duration="5s" delay="0.2s" />
        <Rocket><RocketTrail /></Rocket>
        <AchievementBadge />
        <ProgressCircle />
        <XPOrb style={{ top: '65%', left: '15%' }} duration="6s" delay="0.2s" />
        <XPOrb style={{ top: '30%', right: '25%' }} duration="5s" delay="1.2s" />
        <XPOrb style={{ top: '75%', right: '30%' }} duration="7s" delay="0.5s" />
        <XPOrb style={{ top: '45%', left: '60%' }} duration="5.5s" delay="1.5s" />
      </Background>

      <Sidebar>
        <h2>HabitQuest</h2>
        <NavList>
          <NavItem className="active">Dashboard</NavItem>
          <NavItem onClick={() => navigate('/spinWheel')}>SpinWheel</NavItem>
          <NavItem onClick={() => navigate('/habitProgressTracker')}>HabitProgressTracker</NavItem>
          <NavItem onClick={() => navigate('/breakthrough-game')}>Games</NavItem>
          <NavItem onClick={() => navigate('/track')}>Events</NavItem>
          <NavItem onClick={() => navigate('/review')}>Review</NavItem>
        </NavList>
      </Sidebar>

      <MainContent>
        <Header>
          <UserGreeting>
            <h1>Welcome{user?.name ? `, ${user.name}` : ''}! 👋</h1>
            <LevelBadge>Level {currentLevel} - {totalXP} XP</LevelBadge>
          </UserGreeting>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </Header>

        <GridContainer>
          <Card>
            <h2>Progress Overview</h2>
            <ChartControls>
              <ChartTypeButton active={chartType === 'line'} onClick={() => setChartType('line')}>Line</ChartTypeButton>
              <ChartTypeButton active={chartType === 'bar'} onClick={() => setChartType('bar')}>Bar</ChartTypeButton>
            </ChartControls>
            {loading ? <p>Loading chart data...</p> : <ChartContainer>{renderChart()}</ChartContainer>}
            <h3 style={{ marginTop: '1rem' }}>Current Streak: {streak} days</h3>
            <ProgressBarContainer progress={streakPercentage}><div></div></ProgressBarContainer>
            <p>{streak >= 14 ? 'Streak Maxed!' : `${14 - streak} days to max streak`}</p>
          </Card>

          <Card>
            <h2>Leaderboard</h2>
            <LeaderboardList>
              {sortedLeaderboard.map((player, index) => (
                <LeaderboardItem key={player.name}>
                  <div><UserRank>#{index + 1}</UserRank> {player.name}</div>
                  <UserScore>{player.xp} XP</UserScore>
                </LeaderboardItem>
              ))}
            </LeaderboardList>
          </Card>

          <Card>
            <h2>Achievements</h2>
            <AchievementList>
              {achievements
                .filter(achievement => showAllAchievements || achievement.earned)
                .map(achievement => (
                  <AchievementItem key={achievement.id}>
                    <AchievementTitle>{achievement.title}</AchievementTitle>
                    <AchievementDetails>{achievement.description}</AchievementDetails>
                  </AchievementItem>
                ))}
            </AchievementList>
            <Button style={{ marginTop: '1rem', width: '100%' }} onClick={() => setShowAllAchievements(prev => !prev)}>
              {showAllAchievements ? "Collapse" : "View All Achievements"}
            </Button>
          </Card>

          <Card>
            <h2>Today's Tasks</h2>
            <TaskList>
              {todayTasks.map((task) => (
                <Task key={task.id}>
                  <TaskCheckbox
                    completed={task.completed}
                    onClick={() => handleTaskCompletion(task.id, !task.completed)}
                  />
                  {task.isEditing ? (
                    <EditInput
                      type="text"
                      value={task.title}
                      onChange={(e) => updateEvent(todayKey, task.id, { title: e.target.value })}
                      onBlur={() => toggleEdit(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") toggleEdit(task.id);
                      }}
                    />
                  ) : (
                    <TaskText
                      completed={task.completed}
                      onDoubleClick={() => toggleEdit(task.id)}
                    >
                      {task.title}
                    </TaskText>
                  )}
                  <DeleteButton onClick={() => deleteTask(task.id)}>Delete</DeleteButton>
                </Task>
              ))}
            </TaskList>
            {showInput ? (
              <AddHabitInput
                ref={inputRef}
                type="text"
                placeholder="Add a new task..."
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={() => setShowInput(false)}
              />
            ) : (
              <AddHabitButton onClick={addHabit}>+ Add Task</AddHabitButton>
            )}
          </Card>
        </GridContainer>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;