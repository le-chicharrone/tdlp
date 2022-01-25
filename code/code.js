/* Bad global variables */
var gJson = null;
var gProgress = null;

/* Status management */
const statuses = new Map();
statuses.set("not-started","Not Started");
statuses.set("skipped","Skipped");
statuses.set("started","Started");
statuses.set("completed","Completed");

/* Completion management */
function toggleStatus(currentStatus) {

	if (currentStatus === "not-started") {
		return "skipped";
	} else if (currentStatus === "skipped") {
		return "started";
	} else if (currentStatus === "started") {
		return "completed";
	} else {
		return "not-started";
	}

}

function getStatus(courseId) {

	var result = gProgress.progress.filter(function (record) {
		return record.id === courseId;
	});

	if (result.length === 1) {
		return result[0].status;
	}
	return "not-started";

}

function setStatus(node) {

	var courseId = node.parentNode.dataset.courseid;
	var newStatus = toggleStatus(node.className);

	var cIndex = -1;
	for (var index in gProgress.progress) {
		var oCourse = gProgress.progress[index].id;
		if(typeof oCourse !== "undefined" && oCourse === courseId) {
			cIndex = index;
		}
	}

	if (cIndex !== -1) {
		gProgress.progress[cIndex].status = newStatus;
	} else {
		var entry = {};
		entry["id"] = courseId;
		entry["status"] = newStatus;
		gProgress.progress.push(entry);
	}
	localStorage.setItem("TDLearningPathProgress", JSON.stringify(gProgress));

	node.className = newStatus;
	node.parentNode.title = statuses.get(newStatus);

}

function viewDetails(summaryId, type) {

	var startedCourses = gProgress.progress.filter(function (record) {
		return record.status === "started" && record.id.indexOf(summaryId) === 0;
	});

	if (startedCourses.length > 0) {
		if (typeof type !== "undefined") {

			const sectionId = summaryId.substring(0,1);
			console.log("sectionId = " + sectionId + " --- summaryId = " + summaryId + " --- type = " + type);
			//var courseTypes = gJson.roadmap[""+sectionId].topics[""+summaryId].courses.filter(function (record) {
			var courseTypes = gJson.roadmap.filter(function (section) {
				return section.id === sectionId;
			})[0].topics.filter(function (topic) {
				return topic.id === summaryId;
			})[0].courses.filter(function (course) {
				return course.type === type;
			});

			for (var courseType in courseTypes) {
				for (var startedCourse in startedCourses) {
					console.log("courseTypes[courseType].id = " + courseTypes[courseType].id + " --- startedCourses[startedCourse].id = " + startedCourses[startedCourse].id);
					if (courseTypes[courseType].id === startedCourses[startedCourse].id) {
						return " open";
					}
				}
			}
		} else {
			return " open";
		}

	}
	return "";

}

/* JSON management */
function display(data) {

	$.each(data.roadmap, function (sIndex, section) {
		var sRoadmap = '<section class="roadmap">';
		sRoadmap += '<details  class="level-1"' + viewDetails(section.id) + '>';
		sRoadmap += '<summary>';
		sRoadmap += '<h1>' + section.title + '</h1>';
		sRoadmap += '<p class="description">' + section.description + '</p>';
		sRoadmap += "</summary>";
		sRoadmap += '<div class="container">';

		$.each(section.topics, function (tIndex, topic) {
			// console.log("Opening topic"); 
			sRoadmap += '<div class="topic">';
			sRoadmap += '<div class="topic-bullet"></div>';
			sRoadmap += '<div class="topic-content">';
			sRoadmap += '<article>';
			sRoadmap += '<details class="level-2"' + viewDetails(topic.id) + '>';
			sRoadmap += '<summary>' + topic.title + '<span title="' + topic.description + '">i</span></summary>';

			const basic = topic.courses.filter(c => c.type == "basic");
			const advanced = topic.courses.filter(c => c.type == "advanced");
			const readings = topic.courses.filter(c => c.type == "reading");

			const basicOpen = (basic.length > 0 && advanced.length < 1 && readings.length < 1) ? " open" : viewDetails(topic.id, "basic");
			const advancedOpen = (basic.length < 1 && advanced.length > 0 && readings.length < 1) ? " open" : viewDetails(topic.id, "advanced");
			const readingsOpen = (basic.length < 1 && advanced.length < 1 && readings.length > 0) ? " open" : viewDetails(topic.id, "reading");

			if (basic.length > 0) {
				sRoadmap += '<details class="level-3"' + basicOpen + '>';
				sRoadmap += '<summary>Basic</summary>';
				$.each(basic, function (bIndex, course) {
					sRoadmap += '<div class="course-container"><span class="course"><span class="course-status" title="' + statuses.get(getStatus(course.id)) + '" data-courseid="' + course.id + '"><span onclick="setStatus(this)" class="' + getStatus(course.id) + '"></span></span><span class="course-title">' + course.title + '</span><span class="course-duration">' + course.duration + '</span></span><a class="course-open" href="' + course.url + '" target="_blank">Open</a></div>';
				});
				sRoadmap += '</details>';				
			}

			if (advanced.length > 0) {
				sRoadmap += '<details class="level-3"' + advancedOpen + '>';
				sRoadmap += '<summary>Advanced</summary>';
				$.each(advanced, function (aIndex, course) {
					sRoadmap += '<div class="course-container"><span class="course"><span class="course-status" title="' + statuses.get(getStatus(course.id)) + '" data-courseid="' + course.id + '"><span onclick="setStatus(this)" class="' + getStatus(course.id) + '"></span></span><span class="course-title">' + course.title + '</span><span class="course-duration">' + course.duration + '</span></span><a class="course-open" href="' + course.url + '" target="_blank">Open</a></div>';
				});
				sRoadmap += '</details>';				
			}

			if (readings.length > 0) {
				sRoadmap += '<details class="level-3"' + readingsOpen + '>';
				sRoadmap += '<summary>Suggested Readings</summary>';
				$.each(readings, function (rIndex, course) {
					sRoadmap += '<div class="course-container"><span class="course"><span class="course-status" title="' + statuses.get(getStatus(course.id)) + '" data-courseid="' + course.id + '"><span onclick="setStatus(this)" class="' + getStatus(course.id) + '"></span></span><span class="course-title">' + course.title + '</span><span class="course-duration">' + course.duration + '</span></span><a class="course-open" href="' + course.url + '" target="_blank">Open</a></div>';
				});
				sRoadmap += '</details>';
			}

			// console.log("Closing topic.");
			sRoadmap += '</details>';
			sRoadmap += '</article>';
			sRoadmap += '</div>';
			sRoadmap += '</div>';

		});

		// console.log("Closing roadmap.");
		sRoadmap += '</div>';
		sRoadmap += '</details>';
		sRoadmap += '</section>';
		sRoadmap += '';

		$(sRoadmap).appendTo("#learning-path");

	});
}

$(function () {

	// Check the local object for current progress
	var sProgress = localStorage.getItem("TDLearningPathProgress");
	if (sProgress === null) {
		sProgress = '{"progress" : []}';
		localStorage.setItem("TDLearningPathProgress", sProgress);
	}
	gProgress = JSON.parse(sProgress);

	const jLP = $.getJSON('./data/data.json');
	jLP.done(function (lp) {
		gJson = JSON.parse(JSON.stringify(lp));
		display(gJson);
	});

});
