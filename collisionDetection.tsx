import * as THREE from "three";

// Simple AABB collision detection system
export interface CollisionBox {
  position: [number, number, number];
  size: [number, number, number];
  type: 'player' | 'zombie' | 'bullet' | 'wall' | 'obstacle';
  id: string;
}

export class CollisionSystem {
  private static instance: CollisionSystem;
  private collisionBoxes: Map<string, CollisionBox> = new Map();

  static getInstance(): CollisionSystem {
    if (!CollisionSystem.instance) {
      CollisionSystem.instance = new CollisionSystem();
    }
    return CollisionSystem.instance;
  }

  addCollisionBox(box: CollisionBox): void {
    this.collisionBoxes.set(box.id, box);
  }

  removeCollisionBox(id: string): void {
    this.collisionBoxes.delete(id);
  }

  updateCollisionBox(id: string, updates: Partial<CollisionBox>): void {
    const existingBox = this.collisionBoxes.get(id);
    if (existingBox) {
      this.collisionBoxes.set(id, { ...existingBox, ...updates });
    }
  }

  checkCollision(box1: CollisionBox, box2: CollisionBox): boolean {
    const [x1, y1, z1] = box1.position;
    const [w1, h1, d1] = box1.size;
    const [x2, y2, z2] = box2.position;
    const [w2, h2, d2] = box2.size;

    return (
      Math.abs(x1 - x2) < (w1 + w2) / 2 &&
      Math.abs(y1 - y2) < (h1 + h2) / 2 &&
      Math.abs(z1 - z2) < (d1 + d2) / 2
    );
  }

  getCollisionsForBox(targetBox: CollisionBox): CollisionBox[] {
    const collisions: CollisionBox[] = [];
    
    for (const [id, box] of this.collisionBoxes) {
      if (id !== targetBox.id && this.checkCollision(targetBox, box)) {
        collisions.push(box);
      }
    }
    
    return collisions;
  }

  getCollisionsByType(type: CollisionBox['type']): CollisionBox[] {
    return Array.from(this.collisionBoxes.values()).filter(box => box.type === type);
  }

  // Ray casting for line-of-sight and bullet trajectories
  raycast(
    origin: [number, number, number],
    direction: [number, number, number],
    maxDistance: number = 100,
    ignoreTypes: CollisionBox['type'][] = []
  ): { hit: boolean; hitBox?: CollisionBox; distance: number; hitPoint: [number, number, number] } {
    const ray = new THREE.Ray(
      new THREE.Vector3().fromArray(origin),
      new THREE.Vector3().fromArray(direction).normalize()
    );

    let closestHit: { box: CollisionBox; distance: number; point: THREE.Vector3 } | null = null;

    for (const [id, box] of this.collisionBoxes) {
      if (ignoreTypes.includes(box.type)) continue;

      // Create a bounding box for the collision box
      const boxGeometry = new THREE.Box3(
        new THREE.Vector3(
          box.position[0] - box.size[0] / 2,
          box.position[1] - box.size[1] / 2,
          box.position[2] - box.size[2] / 2
        ),
        new THREE.Vector3(
          box.position[0] + box.size[0] / 2,
          box.position[1] + box.size[1] / 2,
          box.position[2] + box.size[2] / 2
        )
      );

      const intersectionPoint = new THREE.Vector3();
      if (ray.intersectBox(boxGeometry, intersectionPoint)) {
        const distance = ray.origin.distanceTo(intersectionPoint);
        
        if (distance <= maxDistance && (!closestHit || distance < closestHit.distance)) {
          closestHit = { box, distance, point: intersectionPoint };
        }
      }
    }

    if (closestHit) {
      return {
        hit: true,
        hitBox: closestHit.box,
        distance: closestHit.distance,
        hitPoint: [closestHit.point.x, closestHit.point.y, closestHit.point.z]
      };
    }

    return {
      hit: false,
      distance: maxDistance,
      hitPoint: [
        origin[0] + direction[0] * maxDistance,
        origin[1] + direction[1] * maxDistance,
        origin[2] + direction[2] * maxDistance
      ]
    };
  }

  // Check if a position is valid (not colliding with obstacles)
  isPositionValid(
    position: [number, number, number],
    size: [number, number, number],
    ignoreTypes: CollisionBox['type'][] = []
  ): boolean {
    const testBox: CollisionBox = {
      id: 'test',
      position,
      size,
      type: 'player'
    };

    for (const [id, box] of this.collisionBoxes) {
      if (ignoreTypes.includes(box.type)) continue;
      
      if (this.checkCollision(testBox, box)) {
        return false;
      }
    }

    return true;
  }

  // Find the nearest valid position to a target position
  findNearestValidPosition(
    targetPosition: [number, number, number],
    size: [number, number, number],
    searchRadius: number = 5,
    ignoreTypes: CollisionBox['type'][] = []
  ): [number, number, number] | null {
    const [tx, ty, tz] = targetPosition;
    
    // Try the target position first
    if (this.isPositionValid(targetPosition, size, ignoreTypes)) {
      return targetPosition;
    }

    // Search in expanding circles
    for (let radius = 0.5; radius <= searchRadius; radius += 0.5) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const testPos: [number, number, number] = [
          tx + Math.cos(angle) * radius,
          ty,
          tz + Math.sin(angle) * radius
        ];

        if (this.isPositionValid(testPos, size, ignoreTypes)) {
          return testPos;
        }
      }
    }

    return null; // No valid position found
  }

  // Resolve collision by pushing objects apart
  resolveCollision(
    box1: CollisionBox,
    box2: CollisionBox,
    pushStrength: number = 1
  ): { position1: [number, number, number]; position2: [number, number, number] } {
    const [x1, y1, z1] = box1.position;
    const [x2, y2, z2] = box2.position;

    // Calculate overlap
    const overlapX = (box1.size[0] + box2.size[0]) / 2 - Math.abs(x1 - x2);
    const overlapZ = (box1.size[2] + box2.size[2]) / 2 - Math.abs(z1 - z2);

    let pushX = 0;
    let pushZ = 0;

    // Resolve in the direction of least overlap
    if (overlapX < overlapZ) {
      // Push apart horizontally
      pushX = (overlapX / 2 + 0.1) * Math.sign(x1 - x2) * pushStrength;
    } else {
      // Push apart along Z axis
      pushZ = (overlapZ / 2 + 0.1) * Math.sign(z1 - z2) * pushStrength;
    }

    return {
      position1: [x1 + pushX, y1, z1 + pushZ],
      position2: [x2 - pushX, y2, z2 - pushZ]
    };
  }

  // Debug visualization helper
  getAllCollisionBoxes(): CollisionBox[] {
    return Array.from(this.collisionBoxes.values());
  }

  clear(): void {
    this.collisionBoxes.clear();
  }
}

// Export singleton instance
export const collisionSystem = CollisionSystem.getInstance();

// Helper functions for common collision scenarios
export const createPlayerCollisionBox = (position: [number, number, number]): CollisionBox => ({
  id: 'player',
  position,
  size: [0.6, 1.8, 0.3],
  type: 'player'
});

export const createZombieCollisionBox = (id: string, position: [number, number, number]): CollisionBox => ({
  id,
  position,
  size: [0.6, 1.8, 0.3],
  type: 'zombie'
});

export const createBulletCollisionBox = (id: string, position: [number, number, number]): CollisionBox => ({
  id,
  position,
  size: [0.1, 0.1, 0.1],
  type: 'bullet'
});

export const createWallCollisionBox = (id: string, position: [number, number, number], size: [number, number, number]): CollisionBox => ({
  id,
  position,
  size,
  type: 'wall'
});
