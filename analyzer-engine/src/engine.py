import os
import json
from miner import GitMiner
from metrics import CodeMetricsExtractor

class SmartRefactorEngine:
    def __init__(self, repo_url, local_path):
        self.repo_url = repo_url
        self.local_path = local_path
        self.miner = GitMiner(repo_url, local_path)

    def analyze_repository(self):
        # 1. find the top bug-prone files based on historical bug-fix commits
        top_bug_files = self.miner.mine_bug_fixes()
        
        # 2. store the merged final analysis dataset
        repository_report = []

        for file_path, fix_count in top_bug_files:
            # get file path in local repo
            full_file_path = os.path.join(self.local_path, file_path)
            
            if not os.path.exists(full_file_path):
                # filter out files that no longer exist in the latest codebase (e.g., deleted or renamed)
                continue

            # call the extractor we wrote in metrics.py
            extractor = CodeMetricsExtractor(full_file_path)
            static_features = extractor.extract_metrics()

            if static_features:
                # merge the dependent variable (bug fix count) with the independent variables (static code metrics)
                combined_data = {
                    "file_name": os.path.basename(file_path),
                    "relative_path": file_path,
                    "bug_fix_count": fix_count,  # label data (Y)
                    "metrics": static_features   # feature matrix (X)
                }
                repository_report.append(combined_data)

        return repository_report


if __name__ == "__main__":
    TEST_REPO = "https://github.com/pallets/click.git"

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    LOCAL_DIR = os.path.join(BASE_DIR, "..", "test_repos", "click")

    engine = SmartRefactorEngine(TEST_REPO, LOCAL_DIR)
    analysis_results = engine.analyze_repository()

    print(json.dumps(analysis_results, ensure_ascii=False))