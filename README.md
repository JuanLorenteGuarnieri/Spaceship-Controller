# Spaceship Time Trial

An interactive 3D spaceship time-trial game built for the web with React, Three.js and React Three Fiber.

The player pilots a spaceship through a sequence of dynamically oriented stargates while avoiding collisions with the environment and completing the course as quickly as possible.

[**Play the game →**](https://juanlorenteguarnieri.github.io/Spaceship-Controller/)

## Features

* Real-time 3D spaceship control
* Three-axis rotational control
* Forward/backward movement with acceleration and deceleration
* Speed limiting and inertial slowdown
* Oriented Bounding Box (OBB) collision detection
* Sequential 3D checkpoint/stargate course
* Time-trial gameplay and completion timer
* Keyboard controls with runtime key remapping
* Touch-based virtual joystick
* First-person camera coupled to the spacecraft
* GLTF/GLB 3D assets
* Environment lighting
* Event-driven audio using the Web Audio API
* Loading and transition animations
* Restartable game state

## Gameplay

The objective is to pass through all stargates in sequence and complete the course in the shortest possible time.

The course starts with a series of gates aligned along the main flight direction and progressively introduces displaced and rotated gates, requiring the player to control the spacecraft in three dimensions.

```text
Start
  ↓
Stargate 1
  ↓
Stargate 2
  ↓
   ...
  ↓
Final Stargate
  ↓
Finish time
```

A gate is activated when the spacecraft intersects its collision volume. Once triggered, the next checkpoint becomes active and the game timer continues until the complete course has been traversed.

## Spaceship Controller

The spacecraft is controlled in real time inside the React Three Fiber render loop.

Rotational input is applied around the three local axes, while movement uses acceleration, maximum-speed limits and gradual deceleration.

The camera orientation is synchronized with the spacecraft, creating an immersive first-person flight experience.

```text
Input
  │
  ├── Keyboard
  └── Touch Joystick
       │
       ▼
Control State
       │
       ▼
Spaceship Controller
       │
       ├── Rotation
       ├── Acceleration
       └── Movement
       │
       ▼
Collision Detection
       │
       ├── Environment collision
       └── Stargate collision
       │
       ▼
Gameplay State
       │
       ├── Next checkpoint
       ├── Timer
       └── Completion screen
```

## Collision Detection

The game uses oriented bounding boxes to account for the spacecraft and obstacle orientations during collision tests.

The collision pipeline transforms bounding boxes into world-space OBBs and performs OBB-vs-OBB intersection tests for the spacecraft, environment obstacles and active stargates.

The OBB implementation is based on the corresponding Three.js `OBB` utility and the collision system integrates it specifically into the game's movement and checkpoint logic.

## Controls

### Default keyboard controls

| Action                   | Key   |
| ------------------------ | ----- |
| Pitch up                 | W     |
| Pitch down               | S     |
| Roll/turn left           | A     |
| Roll/turn right          | D     |
| Rotate counter-clockwise | Q     |
| Rotate clockwise         | E     |
| Forward                  | Space |
| Backward                 | Shift |

The control configuration can be changed at runtime through the in-game key-mapping interface.

### Touch controls

Mobile/touch input is supported through a virtual joystick that maps the joystick position to directional movement commands.

## Audio

The project uses browser Web Audio APIs for event-driven game sounds.

Separate controllers handle:

* Engine start/stop sounds
* Ambient audio
* Pressure effects
* Boost feedback
* Collision feedback

Audio playback is coordinated with gameplay state transitions.

## 3D Scene

The scene is composed of GLB assets loaded through React Three Fiber and Drei.

Main assets include:

* Spaceship
* Space station
* Stargates
* Engine components
* Smoke effects

The environment uses a cubemap-based background and lighting to create the space setting.

## Technologies

* React 18
* Vite
* Three.js
* React Three Fiber
* React Three Drei
* Framer Motion
* Tailwind CSS
* Web Audio API
* JavaScript / JSX

## Performance

The project uses the rendering loop provided by React Three Fiber for real-time movement and camera updates.

The scene also uses the BVH support provided by React Three Drei for accelerated scene queries.

## Repository Structure

```text
Spaceship-Controller/
├── public/
│   ├── audio/          # Game audio
│   ├── bkg/            # Environment textures
│   └── models/         # GLB 3D assets
│
├── src/
│   ├── assets/         # UI assets
│   ├── components/     # Game, camera, input and audio components
│   ├── constants/      # Shared constants
│   ├── pages/          # Main game page
│   └── utils/          # Collision and utility code
│
├── index.html
├── package.json
└── vite.config.js
```

## Running Locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

Preview the production build with:

```bash
npm run preview
```

## Deployment

The application is configured for deployment to GitHub Pages using `gh-pages`.

```bash
npm run deploy
```

## Author

**Juan Lorente Guarnieri**
