# Implementing a Full-Window Picture-in-Picture (PiP) Mode in LiveKit Video Conference Project

## Overview

This documentation provides a comprehensive guide for implementing a full-window Picture-in-Picture (PiP) mode in LiveKit video conference application. The PiP mode allows users to view the meeting in a resizable and draggable window, improving the usability and flexibility of the conference tool.

## Features

- **Toggle PiP Mode**: Users can easily switch between standard and PiP modes.
- **Draggable and Resizable**: The PiP window can be repositioned and resized according to user preferences.
- **Automatic Activation**: PiP mode automatically activates when the user changes browser tabs, ensuring the meeting remains visible.
- **Customizable UI**: Tailor the appearance and behavior of the PiP window to enhance user experience.

## Step 1: Create the Component Structure

1. **HTML Structure**: Begin by wrapping the main content of your meeting component in a container `<div>`. This structure will help you manage styles and functionalities related to the PiP mode effectively.

2. **Button for Toggling**: Include a button that allows users to toggle the PiP mode on and off.

## Step 2: Define PiP Toggle Functionality

1. **State Management**: Introduce a flag in your component to track whether the PiP mode is active. This flag will be used to conditionally render styles and functionality.

2. **Toggle Function**: Implement a function that changes the state of the PiP flag when the user interacts with the toggle button. This function should handle the logic for entering and exiting PiP mode.

## Step 3: Automatically Enter PiP Mode on Tab Change

1. **Tab Change Detection**: Utilize Angular’s host listener to detect when the browser tab loses focus (e.g., when the user switches tabs). When this event is triggered, check the current state of the PiP mode and activate it if necessary.

## Step 4: Style the PiP Mode with SASS

1. **SASS Styling**: Create SASS styles specifically for the PiP mode. Ensure that the PiP window is visually distinct, possibly with a semi-transparent background, rounded corners, and a shadow effect.

2. **Responsive Design**: Make sure the styles adapt well to different screen sizes, ensuring a good user experience across devices.

## Step 5: Enable Draggable and Resizable PiP Mode

1. **Integrate Dragging and Resizing**: Use a library or custom logic to allow users to drag and resize the PiP window. This functionality enhances usability by enabling users to position the PiP window as they prefer.

2. **Initial Positioning**: Set the initial position of the PiP window to a convenient location, such as the bottom right corner of the screen.

## Step 6: Test the PiP Mode

1. **Manual Testing**: After implementing the PiP mode, conduct thorough testing to ensure the toggle button works as expected and that the PiP window can be dragged and resized properly.

2. **Automatic Activation Test**: Change tabs during a meeting to verify that the PiP mode activates automatically.

## Step 7: Customize as Needed

1. **Window Dimensions**: Adjust the default size and positioning of the PiP window to better suit your application’s design.

2. **Animation and Transition Effects**: Consider adding animations or transitions for a smoother user experience when entering or exiting PiP mode.

3. **Additional Features**: Explore opportunities to enhance the PiP functionality, such as minimizing the main meeting view or controlling audio/video streams from the PiP window.

## Conclusion

By following these steps, you will successfully implement a full-window Picture-in-Picture mode in your LiveKit video conference application, enhancing the overall user experience. Make sure to iterate on the design and functionality based on user feedback for continuous improvement.
