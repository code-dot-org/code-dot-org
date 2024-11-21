// This is a stub component to make the package buildable during the setup phase
// This stub component is to be removed once an actual component is implemented.

import React from "react";

export interface StubSectionProps {
    backgroundColor: 'black' | 'white' | 'red';
    label: string;
}

export const StubSection: React.FC<StubSectionProps> = ({backgroundColor, label}: StubSectionProps) => {
    return <div style={{backgroundColor}}>
        {label}
    </div>
}