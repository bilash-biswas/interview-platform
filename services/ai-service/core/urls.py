from django.urls import path
from .views import AnalyzeView, CodeReviewView

urlpatterns = [
    path('analyze', AnalyzeView.as_view(), name='analyze'),
    path('review', CodeReviewView.as_view(), name='review'),
]
