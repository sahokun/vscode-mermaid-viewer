/**
 * Mermaid Pan/Zoom Preview Script
 *
 * This script is bundled with mermaid.min.js and injected into VSCode's standard Markdown preview
 * to render Mermaid diagrams and add pan and zoom functionality.
 * Standalone implementation - no external dependencies required.
 */

(function() {
    'use strict';

    console.log('[Mermaid Pan/Zoom] Initializing...');

    // State management for multiple diagrams
    const diagramStates = new WeakMap();

    // Detect VSCode theme (dark or light)
    const isDarkTheme = document.body.classList.contains('vscode-dark') ||
                        document.body.classList.contains('vscode-high-contrast');
    const mermaidTheme = isDarkTheme ? 'dark' : 'default';

    console.log(`[Mermaid Pan/Zoom] Detected theme: ${mermaidTheme} (isDark: ${isDarkTheme})`);

    // Initialize Mermaid (bundled in this script)
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false,
            theme: mermaidTheme,
            securityLevel: 'loose'
        });
        console.log('[Mermaid Pan/Zoom] Mermaid initialized from bundle');
    } else {
        console.error('[Mermaid Pan/Zoom] Mermaid not found in bundle!');
    }

    /**
     * Render Mermaid code blocks and initialize pan/zoom
     */
    async function renderMermaidDiagrams() {
        // Find all mermaid code blocks
        const codeBlocks = document.querySelectorAll('code.language-mermaid, pre.language-mermaid code');

        console.log(`[Mermaid Pan/Zoom] Found ${codeBlocks.length} Mermaid code block(s) to render`);

        for (let i = 0; i < codeBlocks.length; i++) {
            const codeBlock = codeBlocks[i];

            // Skip if already rendered
            if (codeBlock.dataset.mermaidRendered) {
                continue;
            }

            try {
                const mermaidCode = codeBlock.textContent;
                const id = `mermaid-diagram-${i}-${Date.now()}`;

                console.log(`[Mermaid Pan/Zoom] Rendering diagram ${i}`);

                // Render with mermaid
                const {svg} = await mermaid.render(id, mermaidCode);

                // Create wrapper
                const wrapper = createWrapper();

                // Insert wrapper and SVG
                const parent = codeBlock.parentElement;
                parent.parentNode.insertBefore(wrapper, parent);
                wrapper.innerHTML = svg;

                // Get the SVG element
                const svgElement = wrapper.querySelector('svg');

                // Apply pan/zoom
                applyPanZoom(wrapper, svgElement);

                // Hide original code block
                parent.style.display = 'none';

                // Mark as rendered
                codeBlock.dataset.mermaidRendered = 'true';

            } catch (error) {
                console.error(`[Mermaid Pan/Zoom] Failed to render diagram ${i}:`, error);
            }
        }
    }

    /**
     * Initialize pan/zoom for already rendered SVG diagrams
     */
    function initializeMermaidPanZoom() {
        // Find already rendered Mermaid SVG elements
        const diagrams = document.querySelectorAll(
            'svg[id^="mermaid-"]'
        );

        console.log(`[Mermaid Pan/Zoom] Found ${diagrams.length} pre-rendered SVG diagram(s)`);

        diagrams.forEach((svg, index) => {
            // Skip if already initialized
            if (svg.dataset.panZoomInitialized) {
                return;
            }

            console.log(`[Mermaid Pan/Zoom] Applying pan/zoom to diagram ${index}`);

            // Create wrapper element
            const wrapper = createWrapper();

            // Insert wrapper before SVG and move SVG into it
            const parent = svg.parentNode;
            parent.insertBefore(wrapper, svg);
            wrapper.appendChild(svg);

            // Apply pan/zoom functionality
            applyPanZoom(wrapper, svg);

            // Mark as initialized
            svg.dataset.panZoomInitialized = 'true';
        });
    }

    /**
     * Create a wrapper element for the diagram
     */
    function createWrapper() {
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-panzoom-wrapper';

        // Apply styles - use transparent background to match theme
        Object.assign(wrapper.style, {
            minWidth: '100%',
            minHeight: '400px',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'grab',
            border: '1px solid var(--vscode-panel-border)',
            borderRadius: '4px',
            padding: '20px',
            margin: '10px 0',
            backgroundColor: 'transparent'
        });

        return wrapper;
    }

    /**
     * Apply pan and zoom functionality to a diagram
     */
    function applyPanZoom(wrapper, svg) {
        // Initial state
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        // Store state
        diagramStates.set(svg, {
            scale,
            translateX,
            translateY
        });

        /**
         * Update the transform of the SVG
         */
        function updateTransform() {
            svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            svg.style.transformOrigin = '0 0';
            svg.style.transition = 'none';

            // Update state
            const state = diagramStates.get(svg);
            if (state) {
                state.scale = scale;
                state.translateX = translateX;
                state.translateY = translateY;
            }
        }

        /**
         * Handle wheel events for zooming
         */
        function handleWheel(e) {
            e.preventDefault();
            e.stopPropagation();

            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Zoom factor
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.min(Math.max(0.1, scale * delta), 5);

            // Zoom towards cursor position
            translateX = x - (x - translateX) * (newScale / scale);
            translateY = y - (y - translateY) * (newScale / scale);
            scale = newScale;

            updateTransform();
        }

        /**
         * Handle mouse down for dragging
         */
        function handleMouseDown(e) {
            // Only left mouse button
            if (e.button !== 0) return;

            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            wrapper.style.cursor = 'grabbing';

            e.preventDefault();
        }

        /**
         * Handle mouse move for dragging
         */
        function handleMouseMove(e) {
            if (!isDragging) return;

            translateX = e.clientX - startX;
            translateY = e.clientY - startY;

            updateTransform();
        }

        /**
         * Handle mouse up to stop dragging
         */
        function handleMouseUp(e) {
            if (!isDragging) return;

            isDragging = false;
            wrapper.style.cursor = 'grab';
        }

        /**
         * Handle double-click to reset zoom
         */
        function handleDoubleClick(e) {
            e.preventDefault();

            scale = 1;
            translateX = 0;
            translateY = 0;

            updateTransform();
        }

        // Attach event listeners
        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        wrapper.addEventListener('mousedown', handleMouseDown);
        wrapper.addEventListener('dblclick', handleDoubleClick);

        // Document-level listeners for drag
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Initial transform
        updateTransform();
    }

    /**
     * Process all Mermaid content: render diagrams and apply pan/zoom
     */
    async function processAllMermaidContent() {
        // First, render any unrendered Mermaid code blocks
        await renderMermaidDiagrams();

        // Then, apply pan/zoom to any pre-rendered SVG diagrams
        initializeMermaidPanZoom();
    }

    /**
     * MutationObserver callback to handle dynamic content updates
     */
    function handleMutations(mutations) {
        // Debounce processing
        if (handleMutations.timeout) {
            clearTimeout(handleMutations.timeout);
        }

        handleMutations.timeout = setTimeout(() => {
            processAllMermaidContent();
        }, 100);
    }

    // Set up MutationObserver to handle preview updates
    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial initialization
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processAllMermaidContent);
    } else {
        // DOM is already ready
        processAllMermaidContent();
    }

    console.log('[Mermaid Pan/Zoom] Setup complete');
})();
