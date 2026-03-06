export interface Exercise {
  id: string;
  name: string;
  category: 'warmup' | 'cardio' | 'strength' | 'mobility' | 'dance' | 'yoga' | 'cooldown';
  duration: number; // in minutes
  calories: number;
  instructions: string[];
  sets?: number;
  reps?: string;
  intensity: 'low' | 'moderate' | 'high';
}

export interface DayPlan {
  day: number;
  title: string;
  focus: string;
  duration: number;
  exercises: Exercise[];
}

export interface AgeGroupPlan {
  ageRange: string;
  minAge: number;
  maxAge: number;
  focus: string;
  weeklyPlan: DayPlan[];
}

// Shelter Home Fitness Program - Age 8-10
const age8to10Plan: AgeGroupPlan = {
  ageRange: '8-10',
  minAge: 8,
  maxAge: 10,
  focus: 'Lower reps, focus on fun and learning movement',
  weeklyPlan: [
    {
      day: 1,
      title: 'Cardio + Stamina',
      focus: 'Build cardiovascular endurance',
      duration: 40,
      exercises: [
        {
          id: '8-10-d1-warmup',
          name: 'Warm-up Sequence',
          category: 'warmup',
          duration: 5,
          calories: 20,
          intensity: 'low',
          instructions: ['March in place', 'Arm circles', 'Side steps', 'Knee highs', 'Light stretch']
        },
        {
          id: '8-10-d1-jacks',
          name: 'Jumping Jacks',
          category: 'cardio',
          duration: 3,
          calories: 25,
          intensity: 'moderate',
          reps: '15-20 reps',
          instructions: ['Jump with legs apart and arms overhead', 'Return to starting position', 'Keep rhythm steady']
        },
        {
          id: '8-10-d1-jog',
          name: 'Jog on Spot',
          category: 'cardio',
          duration: 3,
          calories: 30,
          intensity: 'moderate',
          instructions: ['Jog in place', 'Lift knees slightly', 'Pump arms naturally']
        },
        {
          id: '8-10-d1-knees',
          name: 'High Knees',
          category: 'cardio',
          duration: 2,
          calories: 25,
          intensity: 'high',
          reps: '20 seconds',
          instructions: ['Run in place lifting knees high', 'Pump arms vigorously', 'Maintain good posture']
        },
        {
          id: '8-10-d1-feet',
          name: 'Fast Feet',
          category: 'cardio',
          duration: 2,
          calories: 20,
          intensity: 'moderate',
          reps: '20 seconds',
          instructions: ['Quick small steps in place', 'Stay on balls of feet', 'Keep upper body relaxed']
        },
        {
          id: '8-10-d1-sides',
          name: 'Side Jumps',
          category: 'cardio',
          duration: 3,
          calories: 25,
          intensity: 'moderate',
          reps: '10-15 jumps each side',
          instructions: ['Jump side to side', 'Land softly on both feet', 'Use arms for momentum']
        },
        {
          id: '8-10-d1-game',
          name: 'Follow-the-Leader Running',
          category: 'cardio',
          duration: 10,
          calories: 60,
          intensity: 'moderate',
          instructions: ['Form a line behind instructor', 'Copy leader\'s movements', 'Stay engaged and have fun']
        },
        {
          id: '8-10-d1-cooldown',
          name: 'Cool Down Stretching',
          category: 'cooldown',
          duration: 5,
          calories: 10,
          intensity: 'low',
          instructions: ['Walk slowly to lower heart rate', 'Gentle full body stretches', 'Deep breathing']
        }
      ]
    },
    {
      day: 2,
      title: 'Strength (Upper Body + Core)',
      focus: 'Build basic strength',
      duration: 40,
      exercises: [
        {
          id: '8-10-d2-warmup',
          name: 'Mobility Warm-up',
          category: 'warmup',
          duration: 5,
          calories: 15,
          intensity: 'low',
          instructions: ['Arm circles', 'Shoulder rolls', 'Wrist rotations', 'Light jogging']
        },
        {
          id: '8-10-d2-pushup',
          name: 'Push-ups (Wall or Floor)',
          category: 'strength',
          duration: 5,
          calories: 25,
          intensity: 'moderate',
          sets: 2,
          reps: '5-8 reps',
          instructions: ['Start with wall push-ups if needed', 'Keep body straight', 'Lower chest to floor/wall', 'Push back up']
        },
        {
          id: '8-10-d2-squats',
          name: 'Bodyweight Squats',
          category: 'strength',
          duration: 5,
          calories: 30,
          intensity: 'moderate',
          sets: 2,
          reps: '10-12 reps',
          instructions: ['Feet shoulder-width apart', 'Lower hips back and down', 'Keep knees behind toes', 'Stand back up']
        },
        {
          id: '8-10-d2-plank',
          name: 'Plank Hold',
          category: 'strength',
          duration: 3,
          calories: 15,
          intensity: 'moderate',
          reps: '15-20 seconds',
          instructions: ['Forearms on ground', 'Body in straight line', 'Hold position', 'Breathe normally']
        },
        {
          id: '8-10-d2-superman',
          name: 'Superman Hold',
          category: 'strength',
          duration: 3,
          calories: 10,
          intensity: 'low',
          reps: '10-15 seconds',
          instructions: ['Lie face down', 'Lift arms and legs off ground', 'Hold position', 'Lower gently']
        },
        {
          id: '8-10-d2-stretch',
          name: 'Stretching',
          category: 'cooldown',
          duration: 5,
          calories: 10,
          intensity: 'low',
          instructions: ['Arm stretches', 'Leg stretches', 'Back stretches', 'Deep breathing']
        }
      ]
    },
    {
      day: 3,
      title: 'Mobility + Posture',
      focus: 'Improve flexibility and posture',
      duration: 40,
      exercises: [
        {
          id: '8-10-d3-neck',
          name: 'Neck Rotations',
          category: 'mobility',
          duration: 3,
          calories: 5,
          intensity: 'low',
          reps: '5 rotations each direction',
          instructions: ['Slowly turn head side to side', 'Keep movements gentle', 'Do not force rotation']
        },
        {
          id: '8-10-d3-arms',
          name: 'Arm Circles',
          category: 'mobility',
          duration: 3,
          calories: 10,
          intensity: 'low',
          reps: '10 forward, 10 backward',
          instructions: ['Arms out to sides', 'Make small circles', 'Gradually increase size', 'Reverse direction']
        },
        {
          id: '8-10-d3-hips',
          name: 'Hip Circles',
          category: 'mobility',
          duration: 3,
          calories: 10,
          intensity: 'low',
          reps: '10 each direction',
          instructions: ['Hands on hips', 'Make circles with hips', 'Keep feet planted', 'Reverse direction']
        },
        {
          id: '8-10-d3-toes',
          name: 'Toe Touches',
          category: 'mobility',
          duration: 3,
          calories: 10,
          intensity: 'low',
          reps: '10 slow reps',
          instructions: ['Stand with feet together', 'Slowly bend to touch toes', 'Keep knees slightly bent', 'Rise slowly']
        },
        {
          id: '8-10-d3-squats',
          name: 'Slow Squats',
          category: 'mobility',
          duration: 5,
          calories: 20,
          intensity: 'low',
          reps: '8-10 slow reps',
          instructions: ['Lower very slowly (3 counts)', 'Pause at bottom', 'Rise slowly', 'Focus on form']
        },
        {
          id: '8-10-d3-catcow',
          name: 'Cat-Cow Stretch',
          category: 'mobility',
          duration: 5,
          calories: 10,
          intensity: 'low',
          reps: '10 rounds',
          instructions: ['On hands and knees', 'Arch back up (cat)', 'Dip back down (cow)', 'Coordinate with breath']
        },
        {
          id: '8-10-d3-balance',
          name: 'One-Leg Stand',
          category: 'mobility',
          duration: 5,
          calories: 10,
          intensity: 'low',
          reps: '20 seconds each leg',
          instructions: ['Stand on one foot', 'Hold steady', 'Use wall for support if needed', 'Switch legs']
        }
      ]
    },
    {
      day: 4,
      title: 'Dance Fitness',
      focus: 'Fun rhythmic movement',
      duration: 40,
      exercises: [
        {
          id: '8-10-d4-rhythm',
          name: 'Rhythm Warm-up',
          category: 'dance',
          duration: 5,
          calories: 20,
          intensity: 'low',
          instructions: ['Clap to the beat', 'March in place', 'Shoulder shrugs', 'Head nods']
        },
        {
          id: '8-10-d4-step',
          name: 'Step Touch',
          category: 'dance',
          duration: 5,
          calories: 30,
          intensity: 'moderate',
          instructions: ['Step side to side', 'Touch foot beside other', 'Add arm movements', 'Keep rhythm']
        },
        {
          id: '8-10-d4-clap',
          name: 'Clap Patterns',
          category: 'dance',
          duration: 5,
          calories: 20,
          intensity: 'moderate',
          instructions: ['Follow instructor\'s clap pattern', 'Clap overhead', 'Clap in front', 'Keep energy up']
        },
        {
          id: '8-10-d4-forward',
          name: 'Forward-Back Steps',
          category: 'dance',
          duration: 5,
          calories: 30,
          intensity: 'moderate',
          instructions: ['Step forward and back', 'Add knee lifts', 'Use arms', 'Stay on beat']
        },
        {
          id: '8-10-d4-spin',
          name: 'Spin and Clap',
          category: 'dance',
          duration: 5,
          calories: 25,
          intensity: 'moderate',
          instructions: ['Spin around', 'Clap when facing front', 'Alternate directions', 'Have fun!']
        },
        {
          id: '8-10-d4-stretch',
          name: 'Dance Cool Down',
          category: 'cooldown',
          duration: 5,
          calories: 10,
          intensity: 'low',
          instructions: ['Slow swaying', 'Deep breathing', 'Gentle stretches', 'Gradual heart rate reduction']
        }
      ]
    },
    {
      day: 5,
      title: 'Strength (Legs + Core)',
      focus: 'Lower body and core strength',
      duration: 40,
      exercises: [
        {
          id: '8-10-d5-warmup',
          name: 'Warm-up',
          category: 'warmup',
          duration: 5,
          calories: 20,
          intensity: 'low',
          instructions: ['Light jogging', 'Leg swings', 'Hip circles', 'Ankle rotations']
        },
        {
          id: '8-10-d5-squats',
          name: 'Squats',
          category: 'strength',
          duration: 5,
          calories: 30,
          intensity: 'moderate',
          sets: 2,
          reps: '10-12 reps',
          instructions: ['Feet shoulder-width apart', 'Lower hips back and down', 'Chest up', 'Drive through heels to stand']
        },
        {
          id: '8-10-d5-lunges',
          name: 'Lunges',
          category: 'strength',
          duration: 5,
          calories: 30,
          intensity: 'moderate',
          sets: 2,
          reps: '6-8 each leg',
          instructions: ['Step forward into lunge', 'Lower back knee toward ground', 'Push back to start', 'Alternate legs']
        },
        {
          id: '8-10-d5-bridge',
          name: 'Glute Bridges',
          category: 'strength',
          duration: 4,
          calories: 20,
          intensity: 'moderate',
          sets: 2,
          reps: '10-12 reps',
          instructions: ['Lie on back, knees bent', 'Lift hips off ground', 'Squeeze glutes at top', 'Lower slowly']
        },
        {
          id: '8-10-d5-calf',
          name: 'Calf Raises',
          category: 'strength',
          duration: 3,
          calories: 15,
          intensity: 'moderate',
          sets: 2,
          reps: '12-15 reps',
          instructions: ['Stand on balls of feet', 'Rise up on toes', 'Lower heels down', 'Hold wall for balance']
        },
        {
          id: '8-10-d5-plank',
          name: 'Plank',
          category: 'strength',
          duration: 3,
          calories: 15,
          intensity: 'moderate',
          reps: '20-30 seconds',
          instructions: ['Forearms on ground', 'Body straight line', 'Engage core', 'Breathe steady']
        },
        {
          id: '8-10-d5-stretch',
          name: 'Stretch',
          category: 'cooldown',
          duration: 5,
          calories: 10,
          intensity: 'low',
          instructions: ['Hamstring stretch', 'Quad stretch', 'Calf stretch', 'Lower back stretch']
        }
      ]
    },
    {
      day: 6,
      title: 'Yoga + Stress Relief',
      focus: 'Relaxation and flexibility',
      duration: 40,
      exercises: [
        {
          id: '8-10-d6-mountain',
          name: 'Mountain Pose',
          category: 'yoga',
          duration: 3,
          calories: 5,
          intensity: 'low',
          instructions: ['Stand tall', 'Feet together', 'Arms at sides', 'Breathe deeply']
        },
        {
          id: '8-10-d6-forward',
          name: 'Forward Bend',
          category: 'yoga',
          duration: 3,
          calories: 8,
          intensity: 'low',
          instructions: ['Stand tall', 'Hinge at hips', 'Reach toward toes', 'Relax neck']
        },
        {
          id: '8-10-d6-catcow',
          name: 'Cat-Cow',
          category: 'yoga',
          duration: 5,
          calories: 10,
          intensity: 'low',
          reps: '10 rounds',
          instructions: ['On hands and knees', 'Inhale arch back (cow)', 'Exhale round back (cat)', 'Flow with breath']
        },
        {
          id: '8-10-d6-cobra',
          name: 'Cobra',
          category: 'yoga',
          duration: 3,
          calories: 8,
          intensity: 'low',
          reps: '3-5 rounds',
          instructions: ['Lie on stomach', 'Hands under shoulders', 'Lift chest up', 'Hold briefly, lower']
        },
        {
          id: '8-10-d6-child',
          name: 'Child\'s Pose',
          category: 'yoga',
          duration: 4,
          calories: 5,
          intensity: 'low',
          instructions: ['Kneel and sit back on heels', 'Forehead to ground', 'Arms extended or by sides', 'Breathe and relax']
        },
        {
          id: '8-10-d6-butterfly',
          name: 'Butterfly Stretch',
          category: 'yoga',
          duration: 4,
          calories: 5,
          intensity: 'low',
          instructions: ['Sit with feet together', 'Knees out to sides', 'Gently press knees down', 'Hold and breathe']
        },
        {
          id: '8-10-d6-twist',
          name: 'Gentle Twists',
          category: 'yoga',
          duration: 4,
          calories: 8,
          intensity: 'low',
          reps: '5 each side',
          instructions: ['Sit or stand', 'Twist torso to one side', 'Look over shoulder', 'Switch sides']
        },
        {
          id: '8-10-d6-breathing',
          name: 'Relaxation Breathing',
          category: 'yoga',
          duration: 5,
          calories: 5,
          intensity: 'low',
          instructions: ['Lie on back comfortably', 'Close eyes', 'Breathe in for 4 counts', 'Breathe out for 4 counts']
        }
      ]
    },
    {
      day: 7,
      title: 'Rest / Light Play',
      focus: 'Active recovery',
      duration: 30,
      exercises: [
        {
          id: '8-10-d7-walk',
          name: 'Walking',
          category: 'cooldown',
          duration: 15,
          calories: 60,
          intensity: 'low',
          instructions: ['Walk at comfortable pace', 'Can be indoors or outdoors', 'Chat with friends', 'Enjoy movement']
        },
        {
          id: '8-10-d7-stretch',
          name: 'Light Stretching',
          category: 'cooldown',
          duration: 10,
          calories: 15,
          intensity: 'low',
          instructions: ['Gentle full body stretches', 'Hold each 15-20 seconds', 'No strain', 'Relax and breathe']
        },
        {
          id: '8-10-d7-games',
          name: 'Optional Games',
          category: 'cooldown',
          duration: 5,
          calories: 20,
          intensity: 'low',
          instructions: ['Tag games', 'Ball games', 'Group activities', 'Have fun!']
        }
      ]
    }
  ]
};

// Shelter Home Fitness Program - Age 10-12
const age10to12Plan: AgeGroupPlan = {
  ageRange: '10-12',
  minAge: 10,
  maxAge: 12,
  focus: 'Moderate reps, build coordination',
  weeklyPlan: [
    {
      day: 1,
      title: 'Cardio + Stamina',
      focus: 'Build cardiovascular endurance',
      duration: 40,
      exercises: [
        {
          id: '10-12-d1-warmup',
          name: 'Warm-up Sequence',
          category: 'warmup',
          duration: 5,
          calories: 20,
          intensity: 'low',
          instructions: ['March in place', 'Arm circles', 'Side steps', 'Knee highs', 'Light stretch']
        },
        {
          id: '10-12-d1-jacks',
          name: 'Jumping Jacks',
          category: 'cardio',
          duration: 3,
          calories: 30,
          intensity: 'moderate',
          reps: '20-25 reps',
          instructions: ['Full range of motion', 'Arms touch overhead', 'Feet go wide', 'Keep pace steady']
        },
        {
          id: '10-12-d1-jog',
          name: 'Jog on Spot',
          category: 'cardio',
          duration: 4,
          calories: 40,
          intensity: 'moderate',
          instructions: ['Higher knee lift than younger group', 'Maintain steady breathing', 'Good arm swing']
        },
        {
          id: '10-12-d1-knees',
          name: 'High Knees',
          category: 'cardio',
          duration: 3,
          calories: 35,
          intensity: 'high',
          reps: '30 seconds',
          instructions: ['Lift knees to hip height', 'Quick tempo', 'Engage core', 'Pump arms']
        },
        {
          id: '10-12-d1-feet',
          name: 'Fast Feet',
          category: 'cardio',
          duration: 3,
          calories: 30,
          intensity: 'moderate',
          reps: '30 seconds',
          instructions: ['Rapid foot movement', 'Low to ground', 'Stay light', 'Control breathing']
        },
        {
          id: '10-12-d1-sides',
          name: 'Side Jumps',
          category: 'cardio',
          duration: 4,
          calories: 35,
          intensity: 'moderate',
          reps: '15-20 jumps each side',
          instructions: ['Explosive side-to-side movement', 'Land softly', 'Use arms', 'Maintain rhythm']
        },
        {
          id: '10-12-d1-game',
          name: 'Follow-the-Leader Running',
          category: 'cardio',
          duration: 10,
          calories: 70,
          intensity: 'moderate',
          instructions: ['More complex movement patterns', 'Include direction changes', 'Stay alert', 'Encourage others']
        },
        {
          id: '10-12-d1-cooldown',
          name: 'Cool Down Stretching',
          category: 'cooldown',
          duration: 5,
          calories: 10,
          intensity: 'low',
          instructions: ['Walk to lower heart rate', 'Static stretches', 'Focus on legs and hips', 'Deep breathing']
        }
      ]
    },
    {
      day: 2,
      title: 'Strength (Upper Body + Core)',
      focus: 'Build upper body strength',
      duration: 40,
      exercises: [
        {
          id: '10-12-d2-warmup',
          name: 'Mobility Warm-up',
          category: 'warmup',
          duration: 5,
          calories: 20,
          intensity: 'low',
          instructions: ['Arm circles', 'Shoulder rolls', 'Wrist rotations', 'Neck stretches', 'Light jogging']
        },
        {
          id: '10-12-d2-pushup',
          name: 'Push-ups (Wall or Floor)',
          category: 'strength',
          duration: 6,
          calories: 35,
          intensity: 'moderate',
          sets: 2,
          reps: '8-12 reps',
          instructions: ['Full push-ups if possible', 'Knee push-ups as alternative', 'Keep body straight', 'Full range of motion']
        },
        {
          id: '10-12-d2-squats',
          name: 'Bodyweight Squats',
          category: 'strength',
          duration: 5,
          calories: 35,
          intensity: 'moderate',
          sets: 2,
          reps: '12-15 reps',
          instructions: ['Proper depth - thighs parallel', 'Knees track over toes', 'Chest stays up', 'Controlled movement']
        },
        {
          id: '10-12-d2-plank',
          name: 'Plank Hold',
          category: 'strength',
          duration: 4,
          calories: 20,
          intensity: 'moderate',
          reps: '25-35 seconds',
          instructions: ['Straight line from head to heels', 'Engage core', 'Don\'t hold breath', 'Quality over duration']
        },
        {
          id: '10-12-d2-superman',
          name: 'Superman Hold',
          category: 'strength',
          duration: 4,
          calories: 15,
          intensity: 'moderate',
          reps: '15-20 seconds',
          instructions: ['Simultaneous arm and leg lift', 'Hold at top', 'Lower with control', 'Engage lower back']
        },
        {
          id: '10-12-d2-stretch',
          name: 'Stretching',
          category: 'cooldown',
          duration: 5,
          calories: 10,
          intensity: 'low',
          instructions: ['Upper body focus', 'Hold each stretch 20 seconds', 'Gentle and steady', 'Breathe deeply']
        }
      ]
    },
    {
      day: 3,
      title: 'Mobility + Posture',
      focus: 'Improve flexibility and posture',
      duration: 40,
      exercises: [
        {
          id: '10-12-d3-neck',
          name: 'Neck Rotations',
          category: 'mobility',
          duration: 3,
          calories: 5,
          intensity: 'low',
          reps: '8 rotations each direction',
          instructions: ['Slow controlled movement', 'Gentle range', 'No forcing', 'Feel the stretch']
        },
        {
          id: '10-12-d3-arms',
          name: 'Arm Circles',
          category: 'mobility',
          duration: 3,
          calories: 12,
          intensity: 'low',
          reps: '12 forward, 12 backward',
          instructions: ['Full range circles', 'Gradual size increase', 'Control the movement', 'Feel shoulder mobility']
        },
        {
          id: '10-12-d3-hips',
          name: 'Hip Circles',
          category: 'mobility',
          duration: 4,
          calories: 12,
          intensity: 'low',
          reps: '12 each direction',
          instructions: ['Wide circles', 'Keep upper body stable', 'Feel hip joints opening', 'Smooth motion']
        },
        {
          id: '10-12-d3-toes',
          name: 'Toe Touches',
          category: 'mobility',
          duration: 4,
          calories: 12,
          intensity: 'low',
          reps: '12 slow reps',
          instructions: ['Straight legs if possible', 'Hinge at hips', 'Reach for toes', 'Rise with flat back']
        },
        {
          id: '10-12-d3-squats',
          name: 'Slow Squats',
          category: 'mobility',
          duration: 5,
          calories: 25,
          intensity: 'low',
          reps: '10-12 slow reps',
          instructions: ['3 counts down, 1 up', 'Deep range of motion', 'Keep heels down', 'Focus on mobility']
        },
        {
          id: '10-12-d3-catcow',
          name: 'Cat-Cow Stretch',
          category: 'mobility',
          duration: 5,
          calories: 12,
          intensity: 'low',
          reps: '12 rounds',
          instructions: ['Full spinal articulation', 'Coordinate breath with movement', 'Hold each position briefly', 'Flow smoothly']
        },
        {
          id: '10-12-d3-balance',
          name: 'One-Leg Stand',
          category: 'mobility',
          duration: 6,
          calories: 12,
          intensity: 'low',
          reps: '30 seconds each leg',
          instructions: ['Eyes open or closed for challenge', 'Arms out for balance', 'Engage core', 'Switch smoothly']
        }
      ]
    },
    {
      day: 4,
      title: 'Dance Fitness',
      focus: 'Fun rhythmic movement',
      duration: 40,
      exercises: [
        {
          id: '10-12-d4-rhythm',
          name: 'Rhythm Warm-up',
          category: 'dance',
          duration: 5,
          calories: 25,
          intensity: 'low',
          instructions: ['Body percussion', 'Clap patterns', 'Stomp rhythms', 'Snap fingers', 'Feel the beat']
        },
        {
          id: '10-12-d4-step',
          name: 'Step Touch',
          category: 'dance',
          duration: 6,
          calories: 40,
          intensity: 'moderate',
          instructions: ['Larger step movements', 'Add turns', 'Use arms expressively', 'Stay on rhythm']
        },
        {
          id: '10-12-d4-clap',
          name: 'Clap Patterns',
          category: 'dance',
          duration: 5,
          calories: 25,
          intensity: 'moderate',
          instructions: ['Complex patterns', 'Overhead, front, behind', 'Double claps', 'Sync with group']
        },
        {
          id: '10-12-d4-forward',
          name: 'Forward-Back Steps',
          category: 'dance',
          duration: 6,
          calories: 40,
          intensity: 'moderate',
          instructions: ['Add jumps', 'Kick on forward step', 'Squat on back step', 'Energetic arms']
        },
        {
          id: '10-12-d4-spin',
          name: 'Spin and Clap',
          category: 'dance',
          duration: 6,
          calories: 35,
          intensity: 'moderate',
          instructions: ['Multiple spins', 'Clap landing', 'Spotting technique', 'Flow through movement']
        },
        {
          id: '10-12-d4-stretch',
          name: 'Dance Cool Down',
          category: 'cooldown',
          duration: 5,
          calories: 12,
          intensity: 'low',
          instructions: ['Gentle swaying', 'Deep breathing', 'Full body stretch', 'Relax completely']
        }
      ]
    },
    {
      day: 5,
      title: 'Strength (Legs + Core)',
      focus: 'Lower body and core strength',
      duration: 40,
      exercises: [
        {
          id: '10-12-d5-warmup',
          name: 'Warm-up',
          category: 'warmup',
          duration: 5,
          calories: 25,
          intensity: 'low',
          instructions: ['Jogging', 'Leg swings front/back', 'Leg swings side', 'Hip circles', 'Ankle rotations']
        },
        {
          id: '10-12-d5-squats',
          name: 'Squats',
          category: 'strength',
          duration: 6,
          calories: 40,
          intensity: 'moderate',
          sets: 2,
          reps: '12-15 reps',
          instructions: ['Full depth', 'Knees out', 'Weight in heels', 'Explode up']
        },
        {
          id: '10-12-d5-lunges',
          name: 'Lunges',
          category: 'strength',
          duration: 6,
          calories: 40,
          intensity: 'moderate',
          sets: 2,
          reps: '8-10 each leg',
          instructions: ['Long step forward', 'Back knee close to ground', 'Torso upright', 'Push back to start']
        },
        {
          id: '10-12-d5-bridge',
          name: 'Glute Bridges',
          category: 'strength',
          duration: 5,
          calories: 25,
          intensity: 'moderate',
          sets: 2,
          reps: '12-15 reps',
          instructions: ['Feet flat, knees bent', 'Lift hips high', 'Squeeze glutes', 'Lower with control']
        },
        {
          id: '10-12-d5-calf',
          name: 'Calf Raises',
          category: 'strength',
          duration: 4,
          calories: 20,
          intensity: 'moderate',
          sets: 2,
          reps: '15-20 reps',
          instructions: ['Full range of motion', 'Pause at top', 'Lower slowly', 'Single leg option']
        },
        {
          id: '10-12-d5-plank',
          name: 'Plank',
          category: 'strength',
          duration: 4,
          calories: 20,
          intensity: 'moderate',
          reps: '30-40 seconds',
          instructions: ['Straight line position', 'Don\'t let hips sag', 'Breathe steady', 'Engage everything']
        },
        {
          id: '10-12-d5-stretch',
          name: 'Stretch',
          category: 'cooldown',
          duration: 5,
          calories: 10,
          intensity: 'low',
          instructions: ['Lower body focus', 'Hold each 25-30 seconds', 'Gentle stretching', 'Relax muscles']
        }
      ]
    },
    {
      day: 6,
      title: 'Yoga + Stress Relief',
      focus: 'Relaxation and flexibility',
      duration: 40,
      exercises: [
        {
          id: '10-12-d6-mountain',
          name: 'Mountain Pose',
          category: 'yoga',
          duration: 3,
          calories: 5,
          intensity: 'low',
          instructions: ['Stand with purpose', 'Engage thighs', 'Lengthen spine', 'Breathe deeply']
        },
        {
          id: '10-12-d6-forward',
          name: 'Forward Bend',
          category: 'yoga',
          duration: 4,
          calories: 10,
          intensity: 'low',
          instructions: ['Fold at hips', 'Let head hang heavy', 'Reach for ground', 'Bend knees if needed']
        },
        {
          id: '10-12-d6-catcow',
          name: 'Cat-Cow',
          category: 'yoga',
          duration: 5,
          calories: 12,
          intensity: 'low',
          reps: '12 rounds',
          instructions: ['Fluid movement', 'Exaggerate range', 'Connect to breath', 'Spinal mobility']
        },
        {
          id: '10-12-d6-cobra',
          name: 'Cobra',
          category: 'yoga',
          duration: 4,
          calories: 10,
          intensity: 'low',
          reps: '4-6 rounds',
          instructions: ['Press through hands', 'Lift chest', 'Engage back muscles', 'Hold with breath']
        },
        {
          id: '10-12-d6-child',
          name: 'Child\'s Pose',
          category: 'yoga',
          duration: 5,
          calories: 5,
          intensity: 'low',
          instructions: ['Restful position', 'Breathe into back', 'Relax completely', 'Stay as long as needed']
        },
        {
          id: '10-12-d6-butterfly',
          name: 'Butterfly Stretch',
          category: 'yoga',
          duration: 5,
          calories: 5,
          intensity: 'low',
          instructions: ['Sit tall', 'Feet close to body', 'Gentle knee pressure', 'Flap legs lightly']
        },
        {
          id: '10-12-d6-twist',
          name: 'Gentle Twists',
          category: 'yoga',
          duration: 5,
          calories: 10,
          intensity: 'low',
          reps: '6 each side',
          instructions: ['Seated spinal twist', 'Use hand on knee', 'Look behind', 'Both sides']
        },
        {
          id: '10-12-d6-breathing',
          name: 'Relaxation Breathing',
          category: 'yoga',
          duration: 6,
          calories: 5,
          intensity: 'low',
          instructions: ['Comfortable position', '4 counts in, 4 out', 'Focus on breath', 'Quiet mind']
        }
      ]
    },
    {
      day: 7,
      title: 'Rest / Light Play',
      focus: 'Active recovery',
      duration: 30,
      exercises: [
        {
          id: '10-12-d7-walk',
          name: 'Walking',
          category: 'cooldown',
          duration: 15,
          calories: 75,
          intensity: 'low',
          instructions: ['Brisk walk', 'Explore surroundings', 'Group walking', 'Enjoy nature or indoor space']
        },
        {
          id: '10-12-d7-stretch',
          name: 'Light Stretching',
          category: 'cooldown',
          duration: 10,
          calories: 15,
          intensity: 'low',
          instructions: ['Choose favorite stretches', 'Hold 20-30 seconds', 'Gentle and enjoyable', 'Relax']
        },
        {
          id: '10-12-d7-games',
          name: 'Optional Games',
          category: 'cooldown',
          duration: 5,
          calories: 25,
          intensity: 'low',
          instructions: ['Group games', 'Cooperative play', 'Fun activities', 'Social bonding']
        }
      ]
    }
  ]
};

// Export all age group plans
export const SHELTER_HOME_PROGRAMS: AgeGroupPlan[] = [
  age8to10Plan,
  age10to12Plan,
  // Additional age groups would be added here (12-14, 14-16, 16+)
];

// Helper function to get program by age
export const getProgramByAge = (age: number): AgeGroupPlan | null => {
  for (const program of SHELTER_HOME_PROGRAMS) {
    if (age >= program.minAge && age <= program.maxAge) {
      return program;
    }
  }
  // Return closest age group if outside range
  if (age < 8) return age8to10Plan;
  if (age > 12) return age10to12Plan;
  return null;
};

// Helper function to get today's exercise based on day of week
export const getTodaysExercises = (age: number, dayOfWeek: number = new Date().getDay()): DayPlan | null => {
  const program = getProgramByAge(age);
  if (!program) return null;
  
  // Convert Sunday (0) to day 7, Monday (1) to day 1, etc.
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return program.weeklyPlan[dayIndex] || null;
};

// Legacy BMI-based functions (keeping for backwards compatibility)
export const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

export const getBMICategory = (bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' => {
  if (bmi < 18.5) return 'underweight';
  if (bmi >= 18.5 && bmi < 25) return 'normal';
  if (bmi >= 25 && bmi < 30) return 'overweight';
  return 'obese';
};
