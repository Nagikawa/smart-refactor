import os
from miner import GitMiner
from metrics import CodeMetricsExtractor

class SmartRefactorEngine:
    def __init__(self, repo_url, local_path):
        self.repo_url = repo_url
        self.local_path = local_path
        self.miner = GitMiner(repo_url, local_path)

    def analyze_repository(self):
        print("==================================================")
        # 1. find the top bug-prone files based on historical bug-fix commits
        top_bug_files = self.miner.mine_bug_fixes()
        
        # 2. store the merged final analysis dataset
        repository_report = []

        print("\n==================================================")
        print(f"🔥 Starting multi-dimensional static feature extractor, deeply analyzing Top {len(top_bug_files)} risky files...")
        print("==================================================")

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

# ---------------------------------------------------------
# pipelines for local functional testing of the metrics extractor
# ---------------------------------------------------------
if __name__ == "__main__":
    TEST_REPO = "https://github.com/pallets/click.git"
    LOCAL_DIR = "./test_repos/click"

    engine = SmartRefactorEngine(TEST_REPO, LOCAL_DIR)
    analysis_results = engine.analyze_repository()

    print("\n🚀 SmartRefactor engine analysis complete! Comprehensive academic report as follows")
    print("-" * 75)
    
    for item in analysis_results:
        m = item["metrics"]
        print(f"📁 file: {item['file_name']}")
        print(f"   📍 path: {item['relative_path']}")
        print(f"   🔴 historical bug fixes: {item['bug_fix_count']} times")
        print(f"   📊 static code metrics -> lines of code (LOC): {m['loc']} | logical lines of code (LLOC): {m['lloc']} | comment lines: {m['comments']}")
        print(f"   🧠 cyclomatic complexity -> average: {m['avg_complexity']:.2f} | maximum: {m['max_complexity']}")
        print("-" * 75)