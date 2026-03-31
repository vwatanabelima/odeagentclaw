---
name: autoresearch-expert
description: Implementation of a goal-directed iteration loop for code optimization. Follows the "Modify -> Verify -> Keep/Discard -> Repeat" pattern inspired by Karpathy and Udit Goenka. Mandatory for tasks requiring iterative refinement of code to hit a specific mechanical metric (loss, accuracy, time).
version: 1.0.0
type: Hybrid
---

# AutoResearch Expert

This skill enables a systematic, mechanical iteration loop to optimize code. It strictly follows the "8 Critical Rules" for autonomous research.

## ⚙️ Loop Setup
Before starting, the agent MUST establish these parameters with the user:
- **Goal**: The final objective.
- **Metric**: A numerical value to track progress (e.g., "loss", "accuracy", "latency").
- **Verify Command**: The CLI command to run that returns only the metric value or a JSON containing it.
- **Scope**: The list of files the agent is allowed to modify.
- **Direction**: `maximize`, `minimize` (default), or `match`.

## 📜 8 Critical Rules (MANDATORY)
1. **Loop until done**: Continue cycles until the Goal is reached or max iterations hit.
2. **Read before write**: Analyze context (`ls`, `view_file`, `git log`) before any modification.
3. **One change per iteration**: Keep changes atomic. Never modify two distinct things at once.
4. **Mechanical verification only**: Trust only the output of `verify_command`.
5. **Automatic rollback**: If a change fails verification or worsens the metric, revert IMMEDIATELY.
6. **Simplicity wins**: If metrics are equal, prefer the cleaner/lighter code.
7. **Git is memory**: Use Git commits to track experiments and reading the log to avoid repeating errors.
8. **When stuck, think harder**: If the metric is stagnant for 3 cycles, try a radical approach or seek guidance.

## 🛠️ Operating Instructions

### Cycle 0: Baseline
1. Initialize a git repository if one doesn't exist.
2. Ensure the working directory is clean.
3. Run the `verify_command` to establish the Initial Metric value.

### Iteration Loop
1. **Analyze**: Use `git log` and review files to decide on the next experiment.
2. **Modify**: Apply a single, atomic change to a file in the Scope.
3. **Verify**: Execute the `verify_command`.
4. **Evaluate (Mechanical Decision)**:
   - If the metric improved: Commit the change with `experiment: [Brief description]`.
   - If the metric worsened OR command failed: Revert the change (`git checkout .` or `git revert`).
5. **Repeat**: Go back to step 1.

## 📦 Included Scripts

### `iteration_helper.js`
A tool to assist in running the verification command and parsing common output formats.
Execution: `node skills/autoresearch-expert/scripts/iteration_helper.js --cmd "[command]" --metric "[key]"`

---

## 📋 Input/Output Schema

### Required Environment Variables
- `GIT_AUTHOR_NAME`: (Optional) "Autoresearch Agent"
- `GIT_AUTHOR_EMAIL`: (Optional) "agent@autoresearch.ai"

### JSON Input Format
```json
{
  "goal": "Minimize execution time to < 100ms",
  "scope": ["src/algorithms/sort.js"],
  "metric_name": "latency",
  "direction": "minimize",
  "verify_command": "npm run benchmark"
}
```
