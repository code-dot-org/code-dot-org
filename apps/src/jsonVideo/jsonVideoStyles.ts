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

#video-container {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: pointer;
}

iframe {
    width: 100%;
    height: 100%;
    border: none;
    background-color: white;
    pointer-events: none;
}

/* Poster Image */
#poster {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    object-fit: contain;
    background-color: #000;
    z-index: 5;
    pointer-events: auto; /* Ensures clicks register for play/pause */
}

/* Captions Overlay */
#closed-caption-overlay {
    position: absolute;
    inset-x: 0;
    bottom: 1.5rem;
    padding: 0 1rem;
    text-align: center;
    pointer-events: none;
    z-index: 10;
    transition: bottom 0.2s ease-in-out;
}

:host([controls]:not(.playing)) #closed-caption-overlay,
:host([controls].playing:hover) #closed-caption-overlay {
    bottom: 5.5rem;
}

.cc-text {
    display: inline-block;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 1.125rem;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
}

/* Controls Bar */
#controls-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
    display: flex;
    flex-direction: column;
    padding: 0 12px 8px 12px;
    gap: 0;
    transition: opacity 0.2s ease-in-out;
    z-index: 10; /* Ensures controls stay above the poster */
}

:host([controls]) #controls-bar {
    opacity: 1;
}

:host([controls].playing:not(:hover)) #controls-bar {
    opacity: 0;
}

:host(:not([controls])) #controls-bar {
    display: none;
}

/* Make controls look disabled on error */
:host(.has-error) #controls-bar {
    opacity: 0.5;
    pointer-events: none; /* Prevents clicking play/volume/scrubber */
    filter: grayscale(100%);
}

.controls-row {
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
    height: 40px;
}

/* Progress Bar */
#progress-container {
    width: 100%;
    height: 5px;
    display: flex;
    align-items: center;
    margin-bottom: 4px;
}

#progress-bar {
    width: 100%;
    height: 5px;
    cursor: pointer;
    accent-color: white;
    margin: 0;
    padding: 0;
    transition: height 0.1s;
}


/* Control Buttons */
.control-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.9;
    transition: all 0.2s;
    border-radius: 4px;
    color: white;
    font-size: 16px;
}

.control-btn:hover {
    background-color: rgba(255, 255, 255, 0.15);
}

/* State-based icon swaps via CSS content override (FA Pro Unicode code points) */
:host(.playing) #play-btn i::before {
    content: "\\f04c"; /* fa-pause */
}

#mute-btn.muted i::before {
    content: "\\f2e2"; /* fa-volume-slash (Pro) */
}

#cc-btn.disabled i::before {
    content: "\\e135"; /* fa-closed-captioning-slash (Pro) */
}

#fullscreen-btn.fullscreen-active i::before {
    content: "\\f066"; /* fa-compress */
}

/* Volume Slider */
.volume-control {
    display: flex;
    align-items: center;
}

#volume-slider {
    width: 0px;
    height: 4px;
    accent-color: white;
    cursor: pointer;
    opacity: 0;
    transition: width 0.3s ease, opacity 0.2s ease;
    margin: 0;
}

.volume-control:hover #volume-slider {
    width: 80px;
    opacity: 1;
    margin-left: 8px;
    margin-right: 8px;
}

.time-display {
    font-variant-numeric: tabular-nums;
    font-size: 13px;
    margin-left: 8px;
    display: var(--time-display, block);
}

.hidden {
    display: none !important;
}

/* Fullscreen layout */
:host(:fullscreen),
:host(:-webkit-full-screen) {
    aspect-ratio: unset;
    width: 100%;
    height: 100%;
}

/* Progress bar */
input[type=range] {
    -webkit-appearance: none;
    /* Hides the slider so that custom slider can be made */
    width: 100%;
    --progress-value: 0%;
    /* Specific width is required for Firefox. */
    background: linear-gradient(to right, #ffffff 0%, #ffffff var(--progress-value), #ccc var(--progress-value), #ccc 100%);
}

input[type=range]:focus {
    outline: none;
    /* Removes the blue border. Should probably style this for accessibility */
}

/* Progress bar -  Webkit (Chrome, Safari, Edge) */
input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    /* This fixes the oblong shape in Safari */
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: #ffffff;
    border: 1px solid #ddd;
    transition: opacity 0.2s ease-in-out;

    cursor: pointer;

    /* Vertical alignment logic */
    /* margin-top = (track-height + / 2) + border-size (when not using border-box sixing) - (thumb-height / 2) */
    /* Example: track is 5px, thumb is 10px. (5/2) + 2 - (12/2) = 2.5 + 2 - 6 = -1.5px */
    margin-top: -1.5px;

    /* box-shadow for depth */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Progress bar - Firefox */
input[type=range]::-moz-range-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: #ffffff;
    border: 1px solid #ddd;
    transition: opacity 0.2s ease-in-out;

    /* Firefox adds a grey border by default, override it */
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    /* Firefox centers the thumb on the track automatically, no margin-top needed */
}

#progress-container:not(:hover) > input[type=range]::-webkit-slider-thumb {
    opacity: 0;
    pointer-events: none;
}
#progress-container:not(:hover) > input[type=range]::-moz-range-thumb {
    opacity: 0;
    pointer-events: none;
}
`;

export default styles;
