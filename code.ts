figma.showUI(__html__, { width: 440, height: 610 });

figma.ui.onmessage = async msg => {
    if (msg.type === 'generate-mandala') {
        const selectedItems = figma.currentPage.selection as SceneNode[];
        if (selectedItems.length === 0) {
            figma.notify("Please select at least one object.");
            return;
        }
        await generateMandala(selectedItems, msg.symmetry, msg.spacing, msg.layerSpacing, msg.rotation, msg.secondLayer, msg.sizeVariation);
    }
};

async function generateMandala(selectedItems: SceneNode[], symmetry: number, baseSpacing: number, layerSpacing: number, rotationAngle: number, includeSecondLayer: boolean, applySizeVariation: boolean) {
    const mandalaCenter = figma.viewport.center;
    const nodes: SceneNode[] = [];
    const totalLayers = includeSecondLayer ? 2 : 1;

    for (let i = 0; i < symmetry * totalLayers; i++) {
        const angle = (i / (symmetry * totalLayers)) * Math.PI * 2;
        const layerIndex = i % 2;
        const spacing = baseSpacing + (includeSecondLayer && layerIndex === 1 ? layerSpacing : 0);

        selectedItems.forEach((item, idx) => {
            const clonedItem = clone(item);
            if (applySizeVariation) {
                applySizeVariationTransform(clonedItem, idx, symmetry, layerIndex);
            }
            positionItemInMandala(clonedItem, mandalaCenter, angle, spacing, rotationAngle);
            nodes.push(clonedItem);
        });
    }

    const group = figma.group(nodes, figma.currentPage);
    group.name = "Mandala";
}

function clone(item: SceneNode): SceneNode {
    return item.clone();
}

function applySizeVariationTransform(item: SceneNode, index: number, symmetry: number, layerIndex: number) {
    const baseScaleFactor = 1 + Math.sin((Math.PI * index) / symmetry) * 0.1;
    const layerScaleFactor = layerIndex === 0 ? 0.8 : 1.2; // Adjust scale factor for layers
    const scaleFactor = baseScaleFactor * layerScaleFactor;
    
    if ("resize" in item) {
        (item as any).resize(item.width * scaleFactor, item.height * scaleFactor);
    }
}

function positionItemInMandala(item: SceneNode, center: Vector, angle: number, distance: number, rotation: number) {
    item.x = center.x + Math.cos(angle) * distance - item.width / 2;
    item.y = center.y + Math.sin(angle) * distance - item.height / 2;

    const rotationRadians = (rotation * Math.PI) / 180 + angle;
    item.relativeTransform = [
        [Math.cos(rotationRadians), -Math.sin(rotationRadians), item.x],
        [Math.sin(rotationRadians), Math.cos(rotationRadians), item.y]
    ];
}
