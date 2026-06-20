import os
import lizard
from radon.complexity import cc_visit
from radon.raw import analyze

class CodeMetricsExtractor:
    def __init__(self, file_path):
        """
        :param file_path: Path to the source code file to analyze.
        """
        self.file_path = file_path
        self.extension = os.path.splitext(file_path)[1].lower()
    
    def get_raw_code(self):
        """Reads the source code"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file {self.file_path}: {e}")
            return None
        
    def extract_metrics(self):
        """
        extracts code metrics based on file extension
        """
        source_code = self.get_raw_code()
        if not source_code:
            return None
        
        metrics = {
            "loc": 0,                 # Lines of Code
            "lloc": 0,                # Logical Lines of Code
            "comments": 0,            # Number of comments
            "avg_complexity": 0.0,    # Average Cyclomatic Complexity
            "max_complexity": 0.0,    # Maximum Cyclomatic Complexity
            "token_count": 0          # Number of tokens
        }

        # 1. Use lizard for supported languages
        try:
            lizard_analysis = lizard.analyze_file(self.file_path)
            metrics["loc"] = lizard_analysis.nloc
            metrics["token_count"] = lizard_analysis.token_count
            
            if lizard_analysis.function_list:
                complexities = [f.cyclomatic_complexity for f in lizard_analysis.function_list]
                metrics["avg_complexity"] = sum(complexities) / len(complexities)
                metrics["max_complexity"] = max(complexities)
        except Exception as e:
            print(f"Error analyzing file with lizard: {e}")

        # 2. Use radon for Python files
        if self.extension == '.py':
            try:
                raw_stats = analyze(source_code)
                metrics["loc"] = raw_stats.loc
                metrics["comments"] = raw_stats.comments

                radon_cc = cc_visit(source_code)
                if radon_cc:
                    cc_vals = [block.complexity for block in radon_cc]
                    metrics["max_complexity"] = max(metrics["max_complexity"], max(cc_vals))
            except Exception as e:
                print(f"Error analyzing Python file with radon: {e}")
        return metrics

# ---------------------------------------------------------
# local functional test
# ---------------------------------------------------------
if __name__ == "__main__":
    # analyze the current file itself as a test case
    current_file = __file__
    
    extractor = CodeMetricsExtractor(current_file)
    file_features = extractor.extract_metrics()
    
    print(f"\n📊 Local Functional Test - {os.path.basename(current_file)}")
    print("-" * 60)
    if file_features:
        for feature, value in file_features.items():
            if isinstance(value, float):
                print(f"Feature Metric: {feature:<15} | Measured Value: {value:.2f}")
            else:
                print(f"Feature Metric: {feature:<15} | Measured Value: {value}")