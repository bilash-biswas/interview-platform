from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random

import ast

class AnalyzeView(APIView):
    def post(self, request):
        text = request.data.get('text', '')
        
        if not text:
            return Response(
                {"error": "No text provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mock AI Logic
        words = text.split()
        word_count = len(words)
        
        # Simple sentiment heuristic
        positive_words = ['good', 'great', 'excellent', 'happy', 'love', 'amazing', 'best']
        negative_words = ['bad', 'terrible', 'sad', 'hate', 'worst', 'awful', 'poor']
        
        lower_text = text.lower()
        pos_score = sum(1 for w in positive_words if w in lower_text)
        neg_score = sum(1 for w in negative_words if w in lower_text)
        
        if pos_score > neg_score:
            sentiment = "Positive"
            confidence = 0.85 + (min(pos_score, 3) * 0.05)
        elif neg_score > pos_score:
            sentiment = "Negative"
            confidence = 0.85 + (min(neg_score, 3) * 0.05)
        else:
            sentiment = "Neutral"
            confidence = 0.70

        response_data = {
            "analysis": {
                "sentiment": sentiment,
                "confidence": round(confidence, 2),
                "word_count": word_count,
                "summary": f"User is discussing {words[0] if words else 'something'}..." if word_count > 5 else "Short text analysis.",
                "keywords": [w for w in words if len(w) > 5][:3]
            },
            "original_text": text[:100] + "..." if len(text) > 100 else text
        }

        return Response(response_data, status=status.HTTP_200_OK)

class CodeReviewView(APIView):
    def post(self, request):
        code = request.data.get('code', '')
        if not code:
             return Response({"error": "No code provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return Response({"error": f"Syntax Error: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        # Analysis
        function_count = sum(isinstance(node, ast.FunctionDef) for node in ast.walk(tree))
        class_count = sum(isinstance(node, ast.ClassDef) for node in ast.walk(tree))
        
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for n in node.names:
                    imports.append(n.name)
            elif isinstance(node, ast.ImportFrom):
                imports.append(node.module)

        # Recursion and Complexity Heuristics
        has_recursion = False
        loop_count = 0
        for node in ast.walk(tree):
            if isinstance(node, (ast.For, ast.While)):
                loop_count += 1
            if isinstance(node, ast.FunctionDef):
                # Check for recursion in this function
                for child in ast.walk(node):
                    if isinstance(child, ast.Call):
                        if isinstance(child.func, ast.Name) and child.func.id == node.name:
                            has_recursion = True

        suggestions = []
        if loop_count > 1:
            suggestions.append("Nested loops detected. Check for O(n^2) complexity.")
        if has_recursion:
            suggestions.append("Recursion detected. Validate termination conditions.")
        if function_count == 0 and len(code.split('\n')) > 15:
            suggestions.append("Consider extracting logic into functions.")
        if not imports and len(code) > 100:
             suggestions.append("No imports detected. Is this a standalone script?")

        return Response({
            "analysis": {
                "function_count": function_count,
                "class_count": class_count,
                "imports": list(set(filter(None, imports))),
                "complexity_warning": loop_count > 1 or has_recursion,
                "suggestions": suggestions
            }
        }, status=status.HTTP_200_OK)
