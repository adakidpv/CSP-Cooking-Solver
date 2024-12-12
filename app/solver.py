class CookingCSP:
    def __init__(self, dishes, num_burners, num_pans, cleaning_time=3):
        self.dishes = dishes
        self.num_burners = num_burners
        self.num_pans = num_pans
        self.cleaning_time = cleaning_time 
        self.domains = []

    def solve_with_steps(self):
        steps = []
        schedule = []
        domain_updates = []

        sorted_dishes = sorted(self.dishes, key=lambda x: x['cooking_time'], reverse=True)
        pan_availability = [0] * self.num_pans  # Tracks when each pan will be clean
        burner_availability = [0] * self.num_burners  # Tracks when each burner will be free

        for dish in sorted_dishes:
            # Find the earliest time a burner and a pan will be available
            earliest_start_time = max(min(pan_availability), min(burner_availability))

            pan_index = pan_availability.index(min(pan_availability))
            burner_index = burner_availability.index(min(burner_availability))

            cooking_start = earliest_start_time
            cooking_end = cooking_start + dish['cooking_time']

            cleaning_start = cooking_end
            cleaning_end = cleaning_start + self.cleaning_time

            # Update availability for the pan and burner
            pan_availability[pan_index] = cleaning_end
            burner_availability[burner_index] = cooking_end

            # Record domain updates to ssee what we choosse best
            domain_updates.append({
                "dish": dish['name'],
                "pan_availability": pan_availability.copy(),
                "burner_availability": burner_availability.copy(),
            })

            # Add to the schedule
            schedule.append({
                'dish': dish['name'],
                'cleaning_start': cleaning_start,
                'cleaning_end': cleaning_end,
                'cooking_start': cooking_start,
                'cooking_end': cooking_end,
                'burner': burner_index + 1,
                'pan': pan_index + 1,
            })

            # Log steps for visualization
            steps.append({
                'dish': dish['name'],
                'action': 'cook',
                'start_time': cooking_start,
                'end_time': cooking_end,
                'resource': f"Burner {burner_index + 1}, Pan {pan_index + 1}",
            })

            steps.append({
                'dish': dish['name'],
                'action': 'clean',
                'start_time': cleaning_start,
                'end_time': cleaning_end,
                'resource': f"Pan {pan_index + 1}",
            })

        return schedule, steps, domain_updates
