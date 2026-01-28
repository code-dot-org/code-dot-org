const styles = `
:host {
    display: block;
    position: relative;
    background-color: #000;
    width: 100%;
    aspect-ratio: 16 / 9;
    font-family: system-ui, -apple-system, sans-serif;
    user-select: none;
    overflow: hidden;
}

#video-container { width: 100%; height: 100%; position: relative; cursor: pointer; }
iframe { width: 100%; height: 100%; border: none; background-color: white; pointer-events: none; }

/* Captions Overlay */
#closed-caption-overlay {
    position: absolute; inset-x: 0; bottom: 1.5rem; padding: 0 1rem;
    text-align: center; pointer-events: none; z-index: 10;
    transition: bottom 0.2s ease-in-out;
}
:host([controls]:not(.playing)) #closed-caption-overlay,
:host([controls].playing:hover) #closed-caption-overlay { 
    bottom: 5.5rem; 
}

.cc-text {
    display: inline-block; background-color: rgba(0, 0, 0, 0.8);
    color: white; font-size: 1.125rem; padding: 0.25rem 0.75rem; border-radius: 0.25rem;
}

/* Controls Bar */
#controls-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.9));
    display: flex; flex-direction: column; padding: 0 12px 8px 12px;
    gap: 0; z-index: 20;
    transition: opacity 0.2s ease-in-out;
}
:host([controls]) #controls-bar { opacity: 1; }
:host([controls].playing:not(:hover)) #controls-bar { opacity: 0; }
:host(:not([controls])) #controls-bar { display: none; }

.controls-row { display: flex; align-items: center; gap: 8px; color: white; height: 48px; }

/* Progress Bar */
#progress-container { width: 100%; height: 4px; display: flex; align-items: center; margin-bottom: 4px; }
#progress-bar { 
    width: 100%; height: 4px; cursor: pointer; accent-color: white; 
    margin: 0; padding: 0; transition: height 0.1s;
}
#progress-bar:hover { height: 6px; }

/* Control Buttons (Data URIs) */
.control-btn {
    width: 40px; height: 40px; flex-shrink: 0;
    background-color: transparent; background-repeat: no-repeat;
    background-position: center; background-size: 26px;
    border: none; cursor: pointer; opacity: 0.9; transition: all 0.2s;
}
.control-btn:hover { background-color: rgba(255,255,255,0.15); border-radius: 50%; }

#play-btn { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M8 5v14l11-7z'/%3E%3C/svg%3E"); }
:host(.playing) #play-btn { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/%3E%3C/svg%3E"); }

#mute-btn { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='white' stroke-width='2' d='M11 5L6 9H2v6h4l5 4V5z'/%3E%3Cpath fill='none' stroke='white' stroke-width='2' d='M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14'/%3E%3C/svg%3E"); }
#mute-btn.muted { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='white' stroke-width='2' d='M11 5L6 9H2v6h4l5 4V5z'/%3E%3Cline x1='23' y1='9' x2='17' y2='15' stroke='white' stroke-width='2'/%3E%3Cline x1='17' y1='9' x2='23' y2='15' stroke='white' stroke-width='2'/%3E%3C/svg%3E"); }

/* CC Icons with Physical Gapped Border */
#cc-btn { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='5' width='18' height='14' rx='2' fill='none' stroke='white' stroke-width='2'/%3E%3Cpath fill='white' d='M7 15h3c.55 0 1-.45 1-1v-1H9.5v.5h-2v-3h2v.5H11v-1c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm7 0h3c.55 0 1-.45 1-1v-1h-1.5v.5h-2v-3h2v.5H18v-1c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1z'/%3E%3C/svg%3E"); }
#cc-btn.disabled { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='white' stroke-width='2' d='M16 5h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8'/%3E%3Cpath fill='white' d='M7 15h3c.55 0 1-.45 1-1v-1H9.5v.5h-2v-3h2v.5H11v-1c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm7 0h3c.55 0 1-.45 1-1v-1h-1.5v.5h-2v-3h2v.5H18v-1c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1z'/%3E%3Cline x1='19' y1='3' x2='5' y2='21' stroke='white' stroke-width='2'/%3E%3C/svg%3E"); }

/* Volume Slider */
.volume-control { display: flex; align-items: center; }
#volume-slider { width: 0px; height: 4px; accent-color: white; cursor: pointer; opacity: 0; transition: width 0.3s ease, opacity 0.2s ease; margin: 0; }
.volume-control:hover #volume-slider { width: 80px; opacity: 1; margin-left: 8px; margin-right: 8px; }

.time-display { font-variant-numeric: tabular-nums; font-size: 13px; margin-left: 8px; }
.hidden { display: none !important; }

/* Progress bar */
input[type=range] {
  -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
  width: 100%; /* Specific width is required for Firefox. */
  background: transparent; /* Otherwise white in Chrome */
}

input[type=range]:focus {
  outline: none; /* Removes the blue border. Should probably style this for accessibility */
}

/* Progress bar -  Webkit (Chrome, Safari, Edge) */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; /* CRITICAL: This fixes the oblong shape in Safari */
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #ddd; /* Add a border if you like */
  cursor: pointer;
  
  /* Vertical alignment logic */
  /* margin-top = (track-height / 2) - (thumb-height / 2) */
  /* Example: track is 4px, thumb is 16px. (4/2) - (16/2) = 2 - 8 = -6px */
  margin-top: -6px; 
  
  /* box-shadow for depth */
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

/* Progress bar - Firefox */
input[type=range]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #ddd; /* Firefox adds a grey border by default, override it */
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  /* Firefox centers the thumb on the track automatically, no margin-top needed */
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cccccc;
  border-radius: 2px;
}

input[type=range]::-moz-range-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #cccccc;
  border-radius: 2px;
}

`;

export default styles;
