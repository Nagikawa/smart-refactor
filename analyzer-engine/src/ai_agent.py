import requests
import json

class RefactorAgent:
    def __init__(self, model_name="gemma4:e4b", api_url="http://localhost:1234/v1/completions"):
        """
        :param model_name: local model name registered in MLX (e.g., "gemma4:e4b")
        :param api_url: local API endpoint for the AI model (e.g., "http://localhost:1234/v1/completions")
        """
        self.model_name = model_name
        self.api_url = api_url

    def generate_advice(self, file_info):
        """
        accepts a dictionary containing file metrics and bug fix count, 
        constructs a prompt, and queries the local AI model for refactoring advice.
        """
        file_name = file_info['file_name']
        fix_count = file_info['bug_fix_count']
        m = file_info['metrics']
        
        prompt = f"""
        you are a seasoned software architect and experienced software engineering expert.
        analyze the following high-risk code file and provide refactoring advice:
        
        - File Name: {file_name}
        - History Bug Fixes: {fix_count} times
        - Lines of Code (LOC): {m['loc']}
        - Maximum Cyclomatic Complexity: {m['max_complexity']}
        - Average Cyclomatic Complexity: {m['avg_complexity']:.2f}
        - Comment Lines: {m['comments']}
        
        Please briefly answer the following two points:
        1. Why is this file prone to bugs? (Based on metric analysis)
        2. Specific refactoring suggestions (such as splitting functions, reducing nesting, adding unit tests, etc.).
        Please use professional and concise English to answer.
        """

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False
        }

        try:
            print(f"🤖 AI Agent is thinking about the optimization for {file_name}...")
            response = requests.post(self.api_url, json=payload, timeout=30)
            if response.status_code == 200:
                return response.json().get('response', 'Failed to generate advice')
            else:
                return f"❌ AI service connection failed: {response.status_code}"
        except Exception as e:
            return f"⚠️ Failed to connect to local AI model: {str(e)}"

# ---------------------------------------------------------
# 本地 Agent 功能测试
# ---------------------------------------------------------
if __name__ == "__main__":
    # 模拟一个从 engine.py 传过来的高风险文件数据
    mock_data = {
        "file_name": "core_logic.py",
        "bug_fix_count": 12,
        "metrics": {
            "loc": 450,
            "max_complexity": 25,
            "avg_complexity": 8.5,
            "comments": 10
        }
    }
    
    agent = RefactorAgent()
    advice = agent.generate_advice(mock_data)
    print(f"\n💡 【AI Refactoring Expert Advice】\n{'-'*50}\n{advice}")