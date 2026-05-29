import os
import re
from collections import Counter
from git import Repo

class GitMiner:
    def __init__(self, repo_url, local_path):
        """
        :param repo_url: target git repository URL (e.g., 'https://github.com/user/repo.git')
        :param local_path: local directory to clone the repository (e.g., './repo')
        """
        self.repo_url = repo_url
        self.local_path = local_path
        self.repo = None

    def clone_or_open_repo(self):
        """Clone the repository if it doesn't exist, otherwise open it."""
        if os.path.exists(os.path.join(self.local_path, '.git')):
            print(f"Opening existing repository at {self.local_path}")
            self.repo = Repo(self.local_path)
        else:
            print(f"Cloning repository from {self.repo_url} to {self.local_path}")
            self.repo = Repo.clone_from(self.repo_url, self.local_path)
        return self.repo

    def mine_bug_fixes(self):
        """
        Iterate through the commit history and extract commits that are likely bug fixes based on commit messages.
        Conclude files that were changed in those commits and count the frequency of changes to identify hotspots.
        """
        if not self.repo:
            self.clone_or_open_repo()

        bug_keywords = re.compile(r'\b(fix|bug|issue|crash|error|patch|resolve|repair|hotfix)\b', re.IGNORECASE)

        fix_commit_count = 0
        total_commit_count = 0
        bug_prone_files = Counter()

        print("Mining commits for bug fixes...")

        for commit in self.repo.iter_commits():
            total_commit_count += 1
            message = commit.message

            if bug_keywords.search(message):
                fix_commit_count += 1
                
                if commit.parents:
                    diffs = commit.parents[0].diff(commit)
                    for diff in diffs:

                        file_path = diff.b_path if diff.b_path else diff.a_path

                        if file_path.endswith(('.js', '.ts', '.java', '.py', '.cpp', '.c', '.php', '.go')):
                            bug_prone_files[file_path] += 1

        print(f"Mined {fix_commit_count} bug fix commits out of {total_commit_count} total commits.")
        return bug_prone_files.most_common(20)

if __name__ == "__main__":
    TEST_REPO = "https://github.com/pallets/click.git" # Flask 团队的命令行工具库
    LOCAL_DIR = "./test_repos/click"
    
    miner = GitMiner(TEST_REPO, LOCAL_DIR)
    top_bug_files = miner.mine_bug_fixes()
    
    print("\n📊 TOP 20 BUG-PRONE FILES")
    print("-" * 50)
    for rank, (file, count) in enumerate(top_bug_files, 1):
        print(f"Rank {rank:02d} | Fix Count: {count:03d} | File: {file}")