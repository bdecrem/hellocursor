# Changelog

All notable changes to this project will be documented in this file.

## [Configuration]
- ⭐ marks specially designated commits that represent stable, working builds
- When instructed with "remember this commit", the commit will be marked with ⭐
- All commits are logged under [Recent Commits]
- Starred builds are moved to [⭐ Starred Working Builds] with revert instructions
- Automated changelog updates enforced by pre-commit hook
- Cursor AI configured to maintain changelog format

## [⭐ Starred Working Builds]

### March 26, 2024
- **fc894e5** - Test pre-commit hook functionality ⭐
  - Added test comment to verify changelog enforcement
  - Successfully implemented pre-commit hook for changelog updates
  - To revert to this version:
    ```bash
    git revert --no-commit fc894e5..HEAD
    git commit -m "Revert to working version fc894e5 (Pre-commit hook implementation)"
    git push
    ```

- **68792c0** - Working build with fixed GIF loading behavior ⭐
  - Shows new trending GIF on each page load
  - Properly handles GIF loading during spin animation
  - Includes working share functionality with proper routing
  - To revert to this version:
    ```bash
    git revert --no-commit 68792c0..HEAD
    git commit -m "Revert to working version 68792c0 (GIF loading fix)"
    git push
    ```

## [Recent Commits]

### March 26, 2024
- **Current** - Add cookie-based claim banner visibility
  - Added cookie utilities for managing user identification
  - Set cookie when user creates a shared mood
  - Show claim banner only when user visits their own shared mood
  - Added error handling for cookie operations
- **285543b** - Add Cursor AI configuration files
  - Created .cursor configuration file
  - Added pre-commit hook for changelog updates
  - Created .cursor/prompts.md with AI instructions
- **91c2dbc** - Add dismiss button and bottom border to claim banner
  - Added × dismiss button to top-right corner
  - Added thin black bottom border
  - Improved banner interaction and styling
- **03f2092** - Update claim banner styling to subtle silver/grey theme
- **c932b74** - Add claim account banner and form UI
  - Created ClaimBanner component with email form
  - Added styling for the banner and form
  - Integrated banner into SharedPage component
  - Set up placeholder for account claiming logic
- **037ab16** - Update CHANGELOG format to include starred builds and recent commits
- **fe3829c** - Add CHANGELOG.md to track working builds
  - Created changelog file
  - Added documentation for working build 68792c0 