# Implementing a Full-Window Picture-in-Picture (PiP) Mode in Livekit Video conference Project

## Step 1: Create the Component Structure

In component’s HTML file, wrap the main content in a container `div` to make it manageable for styling and toggling PiP mode.

    ```html
    <div class="meeting-container" [ngClass]="{'pip-mode': isPip}">
      <div class="meeting-content">
        <!-- Meeting content goes here -->
      </div>
    </div>

    <button (click)="togglePiP()">Toggle PiP Mode</button>
    ```

## Step 2: Define PiP Toggle Functionality

In the component’s TypeScript file, add a flag to manage PiP mode state and a toggle function.

## Step 3: Style the PiP Mode with SASS

Use SASS to style, to make it look and behave like a Picture-in-Picture window, allowing it to be draggable and resizable.

## Step 4: Enable Draggable PiP Mode

Initially it should be in right side of the screen. Add Angular logic to make the PiP window draggable.

## Step 5: Test the PiP Mode

Click the “Toggle PiP Mode” button, and your meeting component should shrink to a PiP-style window that can be dragged and resized.

## Step 6: Customize as Needed

- Adjust PiP window dimensions or positioning as desired.
- Customize the transition and animation effects in PIP to enhance UX.
