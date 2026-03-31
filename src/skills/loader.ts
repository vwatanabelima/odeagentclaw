import fs from 'fs';
import path from 'path';

export interface Skill {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
}

export class SkillLoader {
  private skillsPath: string;
  private skills: Map<string, Skill> = new Map();

  constructor() {
    // Looks for the existing `skills` folder at the root of the user's workspace
    this.skillsPath = path.resolve(process.cwd(), 'skills');
    this.scanSkills();
  }

  private scanSkills() {
    if (!fs.existsSync(this.skillsPath)) {
      console.warn(`[Skills] Directory not found at ${this.skillsPath}`);
      return;
    }

    const entries = fs.readdirSync(this.skillsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillName = entry.name;
        console.log(`[Skills] Found skill directory: ${skillName} (Implementation integration pending LLM Function Calling support)`);
        // Currently, we just detect folders. Full dynamic importing requires parsing their internal JS/TS structure.
        this.skills.set(skillName, {
          name: skillName,
          description: `Skill wrapper for ${skillName}`,
          execute: async () => `Execution of ${skillName} is not yet implemented.`
        });
      }
    }
  }

  public getAvailableSkills(): Skill[] {
    return Array.from(this.skills.values());
  }
}

export const skillLoader = new SkillLoader();
