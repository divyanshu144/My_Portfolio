# Sci-fi workspace

The user approved a restrained sci-fi workspace: near-black surfaces, cool accents, larger typography, compact top navigation, interactive project diagrams, restrained motion and a compact AI assistant. Preserve case-study evidence, CV download, experience, blog, contact and existing API integrations.

Implementation: replace the sidebar shell in App; add a project/stage explorer in SystemMap; introduce workspace.css after existing styles (leave vcard.css unchanged); replace the roaming avatar with a labelled chat launcher using the existing chat hook. Keep avatar modules intact. Preserve keyboard focus, add chat focus containment, expose direct contact links after removing the sidebar. Respect reduced-motion preferences.

Validation: production build, existing test suite, browser interaction and responsive inspection where available, independent review. No deployment.
