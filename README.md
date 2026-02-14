# Lab Inventory Project

This is a React + TypeScript application for managing lab inventory, built with Vite and Zustand.

## Prerequisites

You need to have **Node.js** installed on your computer to run this project.

1.  **Download Node.js**: Go to [https://nodejs.org/](https://nodejs.org/) and download the "LTS" (Long Term Support) version.
2.  **Install**: Run the installer and follow the prompts.
3.  **Verify**: Open your terminal and run `node -v` and `npm -v` to ensure it's installed.

## How to Run

1.  **Open Terminal**: Open your terminal or command prompt.
2.  **Navigate to Project Folder**:
    ```bash
    cd /Users/tonghuimin/.gemini/antigravity/scratch/lab-inventory
    ```
3.  **Install Dependencies**:
    Run the following command to download the required libraries (React, Zustand, etc.):
    ```bash
    npm install
    ```
4.  **Start the Server**:
    Run this command to start the local development server:
    ```bash
    npm run dev
    ```
5.  **Open in Browser**:
    The terminal will show a URL (usually `http://localhost:5173`). Cmd+Click it or copy-paste it into your browser.

## Project Structure

-   `src/types/schema.ts`: Your defined Box and Sample interfaces.
-   `src/store/labStore.ts`: Your Zustand store logic with persistence.
-   `src/App.tsx`: A demo interface to visualize boxes and samples.

## Features Implemented

-   **Box Management**: Create and delete boxes.
-   **Sample Management**: Add samples to the current box.
-   **Data Persistence**: Data is saved to your browser's LocalStorage, so it won't disappear when you refresh.
-   **Move/Swap Logic**: The `moveSample` function logic is implemented and can be tested by clicking the "Move +1" button on a sample.
