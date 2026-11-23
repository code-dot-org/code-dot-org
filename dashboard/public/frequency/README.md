# frequency

Static letter-frequency widget used by the `FrequencyAnalysis` level type
(`dashboard/app/models/levels/frequency_analysis.rb`), which loads
`frequency/frequency.html`. The CodeBreak levels under
`dashboard/config/levels/custom/frequency_analysis/` use it.

## Open issues

- Add tooltips on bar hover.
- Style the Shift/Random toggle to look more like tabs.
- Dragging a letter rapidly to the left occasionally glitches.
- Store separate mappings for shift mode and random mode.
- Remove the D3 dependency.
- Handle window resize.
