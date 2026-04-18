import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { dark, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggleTheme} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
