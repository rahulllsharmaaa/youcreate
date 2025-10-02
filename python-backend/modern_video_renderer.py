"""
Modern Video Renderer for Educational Content
Supports multiple templates with smooth animations
"""

import json
import os
from typing import Dict, List, Any
from dataclasses import dataclass
from moviepy.editor import (
    VideoClip, AudioFileClip, CompositeVideoClip,
    TextClip, ColorClip, concatenate_videoclips
)
from moviepy.video.fx.all import fadein, fadeout
import numpy as np


@dataclass
class VideoTemplate:
    """Video template configuration"""
    id: int
    name: str
    background_type: str
    primary_color: str
    secondary_color: str
    font_family: str
    layout_type: str
    animation_style: str


class ModernVideoRenderer:
    """Renders educational videos with modern templates"""

    TEMPLATES = {
        1: VideoTemplate(
            id=1,
            name="Teal Gradient Professional",
            background_type="gradient",
            primary_color="#0d9488",
            secondary_color="#14b8a6",
            font_family="Inter",
            layout_type="modern",
            animation_style="smooth"
        ),
        2: VideoTemplate(
            id=2,
            name="Warm Gradient Modern",
            background_type="gradient",
            primary_color="#0d9488",
            secondary_color="#6366f1",
            font_family="Poppins",
            layout_type="modern",
            animation_style="dynamic"
        ),
        3: VideoTemplate(
            id=3,
            name="Cool Blue Academic",
            background_type="gradient",
            primary_color="#3b82f6",
            secondary_color="#8b5cf6",
            font_family="Inter",
            layout_type="classic",
            animation_style="smooth"
        ),
        4: VideoTemplate(
            id=4,
            name="Clean Minimal",
            background_type="solid",
            primary_color="#f3f4f6",
            secondary_color="#1f2937",
            font_family="Inter",
            layout_type="minimal",
            animation_style="subtle"
        )
    }

    WIDTH = 1080
    HEIGHT = 1920
    FPS = 30

    def __init__(self, template_id: int = 1):
        self.template = self.TEMPLATES.get(template_id, self.TEMPLATES[1])

    def hex_to_rgb(self, hex_color: str) -> tuple:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def create_gradient_background(self, duration: float) -> VideoClip:
        """Create gradient background"""
        color1 = self.hex_to_rgb(self.template.primary_color)
        color2 = self.hex_to_rgb(self.template.secondary_color)

        def make_frame(t):
            # Create gradient from top-left to bottom-right
            y, x = np.mgrid[0:self.HEIGHT, 0:self.WIDTH]

            # Diagonal gradient
            gradient = np.sqrt((x/self.WIDTH)**2 + (y/self.HEIGHT)**2)
            gradient = gradient / gradient.max()

            # Interpolate colors
            r = color1[0] * (1 - gradient) + color2[0] * gradient
            g = color1[1] * (1 - gradient) + color2[1] * gradient
            b = color1[2] * (1 - gradient) + color2[2] * gradient

            frame = np.dstack([r, g, b]).astype('uint8')
            return frame

        return VideoClip(make_frame, duration=duration)

    def create_solid_background(self, duration: float) -> ColorClip:
        """Create solid color background"""
        color = self.hex_to_rgb(self.template.primary_color)
        return ColorClip(size=(self.WIDTH, self.HEIGHT), color=color, duration=duration)

    def create_header(self, exam_name: str, course_name: str, duration: float) -> TextClip:
        """Create header with exam name"""
        text_color = 'white' if self.template.background_type == 'gradient' else self.template.primary_color

        header_text = f"{exam_name} {course_name}"

        txt = TextClip(
            header_text,
            fontsize=48,
            color=text_color,
            font=self.template.font_family,
            method='caption',
            size=(self.WIDTH - 160, None),
            align='center'
        )

        txt = txt.set_position(('center', 60)).set_duration(duration)

        if self.template.animation_style != 'subtle':
            txt = txt.crossfadein(0.5)

        return txt

    def create_question_scene(
        self,
        question_text: str,
        options: Dict[str, str] = None,
        duration: float = 10
    ) -> CompositeVideoClip:
        """Create question display scene"""
        clips = []

        # Background
        if self.template.background_type == 'gradient':
            bg = self.create_gradient_background(duration)
        else:
            bg = self.create_solid_background(duration)
        clips.append(bg)

        text_color = 'white' if self.template.background_type == 'gradient' else self.template.secondary_color

        # Question text
        question_clip = TextClip(
            question_text,
            fontsize=28,
            color=text_color,
            font=self.template.font_family,
            method='caption',
            size=(self.WIDTH - 160, 400),
            align='center'
        )
        question_clip = question_clip.set_position(('center', 300)).set_duration(duration)
        clips.append(question_clip)

        # Options
        if options:
            y_offset = 800
            for letter, option_text in sorted(options.items()):
                option_clip = self.create_option_box(letter, option_text, y_offset, duration)
                clips.append(option_clip)
                y_offset += 140

        return CompositeVideoClip(clips, size=(self.WIDTH, self.HEIGHT))

    def create_option_box(
        self,
        letter: str,
        text: str,
        y_position: int,
        duration: float
    ) -> TextClip:
        """Create single option box"""
        text_color = 'white' if self.template.background_type == 'gradient' else self.template.secondary_color

        full_text = f"{letter}. {text}"

        txt = TextClip(
            full_text,
            fontsize=24,
            color=text_color,
            font=self.template.font_family,
            method='caption',
            size=(self.WIDTH - 200, None),
            align='west'
        )

        return txt.set_position((100, y_position)).set_duration(duration)

    def create_timer_scene(self, duration: float = 5) -> CompositeVideoClip:
        """Create countdown timer scene"""
        clips = []

        # Background
        if self.template.background_type == 'gradient':
            bg = self.create_gradient_background(duration)
        else:
            bg = self.create_solid_background(duration)
        clips.append(bg)

        # Countdown numbers
        for i, number in enumerate([5, 4, 3, 2, 1]):
            timer_text = TextClip(
                str(number),
                fontsize=120,
                color='white',
                font=self.template.font_family
            )
            timer_text = timer_text.set_position('center')
            timer_text = timer_text.set_start(i).set_duration(1)
            timer_text = timer_text.crossfadein(0.2).crossfadeout(0.2)
            clips.append(timer_text)

        return CompositeVideoClip(clips, size=(self.WIDTH, self.HEIGHT))

    def create_answer_scene(
        self,
        answer: str,
        solution: str = None,
        duration: float = 8
    ) -> CompositeVideoClip:
        """Create answer reveal scene"""
        clips = []

        # Background
        if self.template.background_type == 'gradient':
            bg = self.create_gradient_background(duration)
        else:
            bg = self.create_solid_background(duration)
        clips.append(bg)

        text_color = 'white' if self.template.background_type == 'gradient' else self.template.secondary_color

        # Answer title
        answer_title = TextClip(
            "Correct Answer:",
            fontsize=32,
            color='#34d399',
            font=self.template.font_family
        )
        answer_title = answer_title.set_position(('center', 400)).set_duration(duration)
        clips.append(answer_title)

        # Answer text
        answer_text = TextClip(
            answer,
            fontsize=36,
            color=text_color,
            font=self.template.font_family,
            method='caption',
            size=(self.WIDTH - 200, None),
            align='center'
        )
        answer_text = answer_text.set_position(('center', 500)).set_duration(duration)
        clips.append(answer_text)

        # Solution
        if solution:
            solution_title = TextClip(
                "Solution:",
                fontsize=28,
                color=text_color,
                font=self.template.font_family
            )
            solution_title = solution_title.set_position(('center', 700)).set_duration(duration)
            clips.append(solution_title)

            solution_text = TextClip(
                solution[:200],  # Truncate if too long
                fontsize=22,
                color=text_color,
                font=self.template.font_family,
                method='caption',
                size=(self.WIDTH - 200, 400),
                align='center'
            )
            solution_text = solution_text.set_position(('center', 800)).set_duration(duration)
            clips.append(solution_text)

        return CompositeVideoClip(clips, size=(self.WIDTH, self.HEIGHT))

    def render_video(
        self,
        output_path: str,
        audio_path: str,
        captions: List[Dict[str, Any]],
        question_data: Dict[str, Any],
        exam_name: str = "Exam",
        course_name: str = "Course"
    ) -> str:
        """Render complete video"""
        scenes = []

        # Load audio
        audio = AudioFileClip(audio_path)
        total_duration = audio.duration

        # Parse captions to identify sections
        has_timer = any(caption.get('type') == 'timer' for caption in captions)

        if has_timer:
            # Find section durations from captions
            question_section = next((c for c in captions if c.get('type') == 'question'), None)
            timer_section = next((c for c in captions if c.get('type') == 'timer'), None)
            answer_section = next((c for c in captions if c.get('type') == 'answer'), None)

            if question_section:
                duration = float(question_section['end']) - float(question_section['start'])
                scene = self.create_question_scene(
                    question_data['statement'],
                    json.loads(question_data.get('options', '{}')) if question_data.get('options') else None,
                    duration
                )
                scenes.append(scene)

            if timer_section:
                scenes.append(self.create_timer_scene(5))

            if answer_section:
                duration = float(answer_section['end']) - float(answer_section['start'])
                scene = self.create_answer_scene(
                    question_data['answer'],
                    question_data.get('solution'),
                    duration
                )
                scenes.append(scene)
        else:
            # Simple single scene video
            scene = self.create_question_scene(
                question_data['statement'],
                json.loads(question_data.get('options', '{}')) if question_data.get('options') else None,
                total_duration
            )
            scenes.append(scene)

        # Concatenate scenes
        final_video = concatenate_videoclips(scenes, method="compose")

        # Add audio
        final_video = final_video.set_audio(audio)

        # Write output
        final_video.write_videofile(
            output_path,
            fps=self.FPS,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            threads=4
        )

        return output_path


def main():
    """Test renderer"""
    renderer = ModernVideoRenderer(template_id=1)

    test_captions = [
        {
            'type': 'question',
            'text': 'Question text here',
            'start': '0.00',
            'end': '5.00'
        },
        {
            'type': 'timer',
            'text': '5... 4... 3... 2... 1...',
            'start': '5.00',
            'end': '10.00'
        },
        {
            'type': 'answer',
            'text': 'Answer revealed',
            'start': '10.00',
            'end': '15.00'
        }
    ]

    test_question = {
        'statement': 'What is 2 + 2?',
        'options': '{"A": "3", "B": "4", "C": "5", "D": "6"}',
        'answer': 'B',
        'solution': 'Simple addition: 2 + 2 = 4'
    }

    print("Test configuration ready. Actual rendering requires audio file.")


if __name__ == "__main__":
    main()
