# Server-Driven UI (SDUI) E-Commerce Starter

A high-performance, resilient, and dynamically themed Server-Driven UI (SDUI) e-commerce application built with React Native, Expo Router, and TypeScript.

---

## 🏗️ Architectural Overview & Design Choices

The application uses an SDUI engine where the homepage structure, themes, campaigns, and actions are controlled entirely by a structured JSON payload (`HomepagePayload`). 

### 1. Component Registry Pattern
Components are decoupled from layout rendering. The `ComponentRegistry` manages the binding of block types (e.g., `BANNER_HERO`, `PRODUCT_GRID_2X2`) to their respective React renderers. A context-based `ComponentRegistryProvider` instantiates the registry and binds dispatch handlers.

### 2. Action Dispatcher
User interactions (e.g., add to cart, deep link) emit descriptive `Action` events. These are processed by a centralized `ActionDispatcher` service, keeping business logic separated from visual presentation components.

### 3. Dynamic Campaign Theme Engine
We built an advanced campaign system supporting dynamic visual changes:
- **Confetti/Lottie Overlays**: Renders active particle/Lottie confetti overlays (`CampaignOverlay.tsx`) on home screens during campaigns.
- **Dynamic Theme Context**: Screen backgrounds, card backgrounds (`colors.card`), borders, and Tab Navigation tints (`app/(tabs)/_layout.tsx`) dynamically update to match the active campaign theme's color palette (e.g. Back to School dark indigo, Summer Playhouse dark cyan, Carnival dark maroon).

---

## 🛡️ Resilience & Defensive Rendering

E-commerce apps must remain resilient against corrupted payload payloads or network drops.

### 1. Safe Schema Parsing
Before rendering any block, `filterValidComponents` validates the JSON structure using a safe parser:
- Basic schema check (`isValidComponentBlock`) verifies presence of `id` and `type`.
- Detailed sub-field validator (`validateComponentBlock`) inspects components type-specifically (e.g., checking that products array is valid and holds full product models), filtering out corrupted nodes before they reach the FlatList.

### 2. Sandbox Error Isolation
Registry renderer invokes component renderers inside a local `try-catch` block. If an individual block component fails during execution, the exception is caught, and it falls back gracefully to a non-intrusive layout block rather than crashing the entire screen.

### 3. SafeImage Component
To prevent blank spaces or layout layout shifting on network errors or CORS blocks:
- **Loading State**: Displays a native inline loading spinner.
- **Error Fallback**: Catches loading failures (via `onError`) and swaps in a beautifully styled card placeholder with a Lucide `Image` icon.
- **Image Optimization**: All images have been migrated to optimized Unsplash URLs using quality and width queries.

---

## 🎨 Premium Visual Elements

We implemented several premium components and animations to wow the user:

### 1. Half-Screen Splash Promotional Screen (`SplashPromo.tsx`)
- Appears on initial launch and slides up from the bottom exactly to half-screen height.
- Features floating 3D food emojis bobbing asynchronously, a subtle rotating sunburst ray background, a staggered entry animation for ticket components, and a pulsing checkout badge.
- Built using optimized Native Animated Drivers for 60fps animations.

### 2. Food-Delivery Style Grid Cards (`ProductItem.tsx`)
- Visual-first card layout featuring a square 1:1 image aspect ratio.
- Features a green veg/non-veg indicator dot, a star-rated rating chip, bestseller status tags, and a modern ADD button.
- Transitions smoothly into an inline quantity control (plus/minus buttons) once items are added.

### 3. Cart Batch Clearing
- Added a destructive **"Clear All"** button to the Cart tab header, visible only when the cart contains items, allowing recruiters/users to empty the cart with a single tap.

---

## 💼 Developer Resume Redirect Easter Egg

To make this review process interactive and fun, we implemented a dual-mode developer resume redirect flow:

- **Proceed to Checkout**: Clicking the primary button in the checkout drawer triggers a confirmation.
  - **Web browsers**: Shows a native `window.confirm` dialog and opens the Google Drive resume link in a new tab (`window.open`).
  - **Mobile devices**: Prompts the user with a native alert popup and launches the resume in-app using Expo's `WebBrowser.openBrowserAsync`.
- **Profile Screen Option**: Added a dedicated **"View Developer's Resume"** option with a Lucide `FileText` icon directly in the Profile screen settings list.

---

## ⚡ Performance & Re-Render Control

Scroll fluidity and frame rate (FPS) are critical in e-commerce list views.

### 1. Predetermined Offsets (`getItemLayout`)
Both primary vertical and horizontal collections utilize `getItemLayout`. Providing exact dimensions prevents dynamic content measurement calculations, eliminating scroll jumps and reducing layout strain.

### 2. Deep Memoization & Context Decoupling
- **Parent Blocks**: Block level components (`DynamicCollection`, `ProductGrid2x2`, etc.) are heavily memoized using custom comparison functions.
- **Context Subscriptions**: Individual `<ProductItem>` cards subscribe directly to the `CartContext` to fetch their respective quantities. When items are added or removed, only the affected `<ProductItem>` re-renders. Parent containers and adjacent product cards are not re-evaluated.

### 3. Virtualized List Tuning
The FlatList configurations have been customized to optimize memory and scrolling performance:
- `removeClippedSubviews={true}`: Frees off-screen item memory.
- `windowSize={5}`: Restricts the virtual viewport calculation window.
- `maxToRenderPerBatch={10}`: Caps item render rate per batch.

---

## 📱 Gesture Handling & Nested Scrolling

We ensured multi-directional list interactions feel snappy and behave predictably:
- **Snap-to-Grid**: Horizontal collections snap smoothly to card boundaries using `snapToInterval` and `decelerationRate="fast"`.
- **Scroll Lock**: Set `directionalLockEnabled={true}` so diagonal drags do not trigger vertical list movement when swiping horizontal carousels.
- **Nested Scrolling**: Enabled `nestedScrollEnabled={true}` on child lists to cooperate gracefully with the vertical parent container.
